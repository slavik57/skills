import {IUserInfo, User, Users} from '../models/user';
import {UserGlobalPermissions, UsersGlobalPermissions, GlobalPermission} from '../models/usersGlobalPermissions';
import {Collection} from 'bookshelf';
import * as _ from 'lodash';
import {Team, Teams} from '../models/team';

export class UserDataHandler {
  public static createUser(userInfo: IUserInfo): Promise<User> {
    return new User(userInfo).save();
  }

  public static getUsers(): Promise<User[]> {
    return new Users().fetch()
      .then((users: Collection<User>) => {
        return users.toArray();
      });
  }

  public static getUserByUsername(userName: string, require: boolean = false): Promise<User> {
    return new User().where({ username: userName }).fetch({ require: require });
  }

  public static getUserGlobalPermissions(username: string): Promise<GlobalPermission[]> {
    return this.getUser(username)
      .then((user: User) => this.fetchUserGlobalPermissions(user))
      .then((usersGlobalPermissions: Collection<UserGlobalPermissions>) => {
        var permissions: UserGlobalPermissions[] = usersGlobalPermissions.toArray();

        return _.map(permissions, _ => GlobalPermission[_.attributes.global_permissions]);
      });
  }

  public static getTeams(userName: string): Promise<Team[]> {
    return this.getUser(userName)
      .then((user: User) => this.fetchUserTeams(user))
      .then((teams: Collection<Team>) => teams.toArray());
  }

  public static getUser(username: string): Promise<User> {
    return new User()
      .query({ where: { username: username } })
      .fetch();
  }

  private static fetchUserGlobalPermissions(user: User): Promise<Collection<UserGlobalPermissions>> {
    if (!user) {
      return Promise.resolve(new UsersGlobalPermissions());
    }

    return user.getGlobalPermissions().fetch();
  }

  private static fetchUserTeams(user: User): Promise<Collection<Team>> {
    if (!user) {
      return Promise.resolve(new Teams());
    }

    return user.getTeams().fetch();
  }
}
