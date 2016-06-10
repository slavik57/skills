import {IDestroyOptions} from "./interfaces/iDestroyOptions";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {GlobalPermission} from "../models/enums/globalPermission";
import {User, Users} from '../models/user';
import {UserGlobalPermissions, UsersGlobalPermissions} from '../models/usersGlobalPermissions';
import {Collection, FetchOptions, SaveOptions} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as _ from 'lodash';
import {Team, Teams} from '../models/team';
import {ITeamOfAUser} from '../models/interfaces/iTeamOfAUser';
import {IUserGlobalPermissions} from '../models/interfaces/iUserGlobalPermissions';
import {Transaction} from 'knex';

export class UserDataHandler {
  public static createUser(userInfo: IUserInfo): Promise<User> {
    return new User(userInfo).save();
  }

  public static deleteUser(userId: number): Promise<User> {
    var idQuery = {}
    idQuery[User.idAttribute] = userId;

    return new User(idQuery).destroy();
  }

  public static getUsers(): Promise<User[]> {
    return new Users().fetch()
      .then((users: Collection<User>) => {
        return users.toArray();
      });
  }

  public static addGlobalPermissions(userId: number, permissionsToAdd: GlobalPermission[]): Promise<UserGlobalPermissions[]> {
    return bookshelf.transaction((_transaction: Transaction) => this._addGlobalPermissionInternal(userId, permissionsToAdd, _transaction));
  }

  public static removeGlobalPermissions(userId: number, permissionsToRemove: GlobalPermission[]): Promise<UserGlobalPermissions[]> {
    return bookshelf.transaction((_transaction: Transaction) => this._removeGlobalPermissionInternal(userId, permissionsToRemove, _transaction));
  }

  public static getUserGlobalPermissions(userId: number): Promise<GlobalPermission[]> {
    return this._fetchUserGlobalPermissions(userId)
      .then((usersGlobalPermissions: Collection<UserGlobalPermissions>) => {
        return this._convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions);
      });
  }

  public static getTeams(userId: number): Promise<ITeamOfAUser[]> {
    var user: User = this._initializeUserByIdQuery(userId);

    return user.getTeams();
  }

  public static getUser(userId: number): Promise<User> {
    return this._initializeUserByIdQuery(userId).fetch();
  }

  private static _initializeUserByIdQuery(teamId: number): User {
    var queryCondition = {};
    queryCondition[User.idAttribute] = teamId;

    return new User(queryCondition);
  }

  private static _fetchUserGlobalPermissions(userId: number): Promise<Collection<UserGlobalPermissions>> {
    var user: User = this._initializeUserByIdQuery(userId);

    return user.globalPermissions().fetch();
  }

  private static _convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions: Collection<UserGlobalPermissions>): GlobalPermission[] {
    var permissions: UserGlobalPermissions[] = usersGlobalPermissions.toArray();

    return _.map(permissions, _ => GlobalPermission[_.attributes.global_permissions]);
  }

  private static _addGlobalPermissionInternal(userId: number, permissionsToAdd: GlobalPermission[], transaction: Transaction): Promise<UserGlobalPermissions[]> {
    var fetchOptions: FetchOptions = {
      withRelated: [User.relatedUserGlobalPermissionsAttribute],
      require: false,
      transacting: transaction
    };

    return this._initializeUserByIdQuery(userId)
      .fetch(fetchOptions)
      .then((user: User) => {
        if (!user) {
          return Promise.reject('User does not exist');
        }

        var existingPermissionsCollection: Collection<UserGlobalPermissions> = user.relations.globalPermissions;

        return this._addNotExistingGlobalPermissions(user.id,
          existingPermissionsCollection,
          permissionsToAdd,
          transaction);
      });
  }

  private static _removeGlobalPermissionInternal(userId: number, permissionsToRemove: GlobalPermission[], transaction: Transaction): Promise<UserGlobalPermissions[]> {
    var user: User = this._initializeUserByIdQuery(userId);

    var permissionsToDeteleQuery: IUserGlobalPermissions[] =
      this._createUserGlobalPermissionInfos(userId, permissionsToRemove);

    var permissionsToDelete: UserGlobalPermissions[] =
      _.map(permissionsToDeteleQuery, _info => new UserGlobalPermissions().where(_info));

    var destroyOptions: IDestroyOptions = {
      require: false,
      cascadeDelete: false,
      transacting: transaction
    };

    var deleteUserPermissionsPromise: Promise<UserGlobalPermissions>[] =
      _.map(permissionsToDelete, _permission => _permission.destroy(destroyOptions));

    return Promise.all(deleteUserPermissionsPromise);
  }

  private static _addNotExistingGlobalPermissions(userId: number,
    existingPermissionsCollection: Collection<UserGlobalPermissions>,
    permissionsToAdd: GlobalPermission[],
    transaction: Transaction): Promise<UserGlobalPermissions[]> {

    var existingPermissions: GlobalPermission[] =
      this._convertPermissionsCollectionsToGlobalPermissions(existingPermissionsCollection);

    var newPermissions: GlobalPermission[] = _.difference(permissionsToAdd, existingPermissions);
    newPermissions = _.uniq(newPermissions);

    var newUserPermissions: UserGlobalPermissions[] =
      this._createUserGlobalPermission(userId, newPermissions);

    var saveOptions: SaveOptions = {
      transacting: transaction
    }

    var newUserPermissionsPromise: Promise<UserGlobalPermissions>[] =
      _.map(newUserPermissions, _permission => _permission.save({}, saveOptions));

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
