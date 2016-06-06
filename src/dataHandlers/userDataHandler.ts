import {IUserInfo} from "../models/interfaces/iUserInfo";
import {GlobalPermission} from "../models/enums/globalPermission";
import {User, Users} from '../models/user';
import {UserGlobalPermissions, UsersGlobalPermissions} from '../models/usersGlobalPermissions';
import {Collection} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as _ from 'lodash';
import {Team, Teams} from '../models/team';
import {ITeamOfAUser} from '../models/interfaces/iTeamOfAUser';
import {IUserGlobalPermissions} from '../models/interfaces/iUserGlobalPermissions';

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

  public static addGlobalPermissions(username: string, permissionsToAdd: GlobalPermission[]): Promise<UserGlobalPermissions[]> {
    return bookshelf.transaction(() => this._addGlobalPermissionInternal(username, permissionsToAdd));
  }

  public static removeGlobalPermissions(username: string, permissionsToRemove: GlobalPermission[]): Promise<UserGlobalPermissions[]> {
    return bookshelf.transaction(() => this._removeGlobalPermissionInternal(username, permissionsToRemove));
  }

  public static getUserGlobalPermissions(username: string): Promise<GlobalPermission[]> {
    return this._fetchUserGlobalPermissionsByUsername(username)
      .then((usersGlobalPermissions: Collection<UserGlobalPermissions>) => {
        return this._convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions);
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

  private static _fetchUserGlobalPermissionsByUsername(username: string): Promise<Collection<UserGlobalPermissions>> {
    return this.getUser(username)
      .then((user: User) => this._fetchUserGlobalPermissions(user));
  }

  private static _fetchUserGlobalPermissions(user: User): Promise<Collection<UserGlobalPermissions>> {
    if (!user) {
      return Promise.resolve(new UsersGlobalPermissions());
    }

    return user.getGlobalPermissions().fetch();
  }

  private static _convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions: Collection<UserGlobalPermissions>): GlobalPermission[] {
    var permissions: UserGlobalPermissions[] = usersGlobalPermissions.toArray();

    return _.map(permissions, _ => GlobalPermission[_.attributes.global_permissions]);
  }

  private static _fetchUserTeams(user: User): Promise<ITeamOfAUser[]> {
    if (!user) {
      return Promise.resolve([]);
    }

    return user.getTeams();
  }

  private static _addGlobalPermissionInternal(username: string, permissionsToAdd: GlobalPermission[]): Promise<UserGlobalPermissions[]> {
    var userPromise: Promise<User> = this.getUser(username);
    var permissionsPromise: Promise<Collection<UserGlobalPermissions>> =
      userPromise.then((user: User) => this._fetchUserGlobalPermissions(user));

    return Promise.all([userPromise, permissionsPromise])
      .then((results: any[]) => {
        var user: User = results[0];
        if (!user) {
          return Promise.reject('User [' + username + '] does not exist');
        }

        var existingPermissionsCollection: Collection<UserGlobalPermissions> = results[1];

        return this._addNotExistingGlobalPermissions(user.id, existingPermissionsCollection, permissionsToAdd);
      });
  }

  private static _removeGlobalPermissionInternal(username: string, permissionsToRemove: GlobalPermission[]): Promise<UserGlobalPermissions[]> {
    return this.getUser(username)
      .then((user: User) => {
        if (!user) {
          return Promise.reject('User [' + username + '] does not exist');
        }

        var permissionsToDeteleQuery: IUserGlobalPermissions[] =
          this._createUserGlobalPermissionInfos(user.id, permissionsToRemove);

        var permissionsToDelete: UserGlobalPermissions[] =
          _.map(permissionsToDeteleQuery, _info => new UserGlobalPermissions().where(_info));

        var deleteUserPermissionsPromise: Promise<UserGlobalPermissions>[] =
          _.map(permissionsToDelete, _permission => _permission.destroy(false));

        return Promise.all(deleteUserPermissionsPromise);
      });
  }

  private static _addNotExistingGlobalPermissions(userId: number,
    existingPermissionsCollection: Collection<UserGlobalPermissions>,
    permissionsToAdd: GlobalPermission[]): Promise<UserGlobalPermissions[]> {

    var existingPermissions: GlobalPermission[] =
      this._convertPermissionsCollectionsToGlobalPermissions(existingPermissionsCollection);

    var newPermissions: GlobalPermission[] = _.difference(permissionsToAdd, existingPermissions);
    newPermissions = _.uniq(newPermissions);

    var newUserPermissions: UserGlobalPermissions[] =
      this._createUserGlobalPermission(userId, newPermissions);

    var newUserPermissionsPromise: Promise<UserGlobalPermissions>[] =
      _.map(newUserPermissions, _permission => _permission.save());

    return Promise.all(newUserPermissionsPromise);
  }

  private static _createUserGlobalPermission(userId: number, permissions: GlobalPermission[]): UserGlobalPermissions[] {
    var userPermissionInfos: IUserGlobalPermissions[] =
      _.map(permissions, _permission => this._createUserGlobalPermissionInfo(userId, _permission));

    return _.map(userPermissionInfos, _info => new UserGlobalPermissions(_info));
  }

  private static _createUserGlobalPermissionInfos(userId: number, permissions: GlobalPermission[]): IUserGlobalPermissions[] {
    return _.map(permissions, _permission => this._createUserGlobalPermissionInfo(userId, _permission));
  }

  private static _createUserGlobalPermissionInfo(userId: number, permission: GlobalPermission): IUserGlobalPermissions {
    return {
      user_id: userId,
      global_permissions: GlobalPermission[permission]
    }
  }
}
