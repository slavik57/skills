import {IUser, User, Users} from '../models/user';
import {UserGlobalPermissions, UsersGlobalPermissions, GlobalPermission} from '../models/usersGlobalPermissions';
import {Collection} from 'bookshelf';
import * as _ from 'lodash';

export class UserDataHandler {
  public static createUser(userInfo: IUser): Promise<User> {
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

  private static getUser(username: string): Promise<User> {
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
}
