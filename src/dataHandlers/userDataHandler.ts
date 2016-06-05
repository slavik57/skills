import {IUserInfo} from "../models/interfaces/iUserInfo";
import {GlobalPermission} from "../models/enums/globalPermission";
import {User, Users} from '../models/user';
import {UserGlobalPermissions, UsersGlobalPermissions} from '../models/usersGlobalPermissions';
import {Collection} from 'bookshelf';
import * as _ from 'lodash';
import {Team, Teams} from '../models/team';
import {ITeamOfAUser} from '../models/interfaces/iTeamOfAUser';

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

  public static getUserGlobalPermissions(username: string): Promise<GlobalPermission[]> {
    return this.getUser(username)
      .then((user: User) => this._fetchUserGlobalPermissions(user))
      .then((usersGlobalPermissions: Collection<UserGlobalPermissions>) => {
        var permissions: UserGlobalPermissions[] = usersGlobalPermissions.toArray();

        return _.map(permissions, _ => GlobalPermission[_.attributes.global_permissions]);
      });
  }

  public static getTeams(userName: string): Promise<ITeamOfAUser[]> {
    return this.getUser(userName)
      .then((user: User) => this._fetchUserTeams(user));
  }

  public static getUser(username: string): Promise<User> {
    return this._buildUserQuery(username).fetch();
  }

  private static _buildUserQuery(username: string): User {
    var queryCondition = {};
    queryCondition[User.usernameAttribute] = username;

    return new User()
      .query({ where: queryCondition });
  }

  private static _fetchUserGlobalPermissions(user: User): Promise<Collection<UserGlobalPermissions>> {
    if (!user) {
      return Promise.resolve(new UsersGlobalPermissions());
    }

    return user.getGlobalPermissions().fetch();
  }

  private static _fetchUserTeams(user: User): Promise<ITeamOfAUser[]> {
    if (!user) {
      return Promise.resolve([]);
    }

    return user.getTeams();
  }
}
