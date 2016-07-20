import {StringManipulator} from "../../common/stringManipulator";
import {QuerySelectors} from "./querySelectors";
import {IDestroyOptions} from "./interfaces/iDestroyOptions";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {GlobalPermission} from "../models/enums/globalPermission";
import {User, Users} from '../models/user';
import {UserGlobalPermissions, UsersGlobalPermissions} from '../models/usersGlobalPermissions';
import {Collection, FetchOptions, SaveOptions} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import * as _ from 'lodash';
import {Team, Teams} from '../models/team';
import {ITeamOfAUser} from '../models/interfaces/iTeamOfAUser';
import {IUserGlobalPermissions} from '../models/interfaces/iUserGlobalPermissions';
import {Transaction, QueryBuilder} from 'knex';
import * as bluebirdPromise from 'bluebird';

export class UserDataHandler {
  public static createUser(userInfo: IUserInfo): bluebirdPromise<User> {
    return new User(userInfo).save();
  }

  public static createUserWithPermissions(userInfo: IUserInfo, permissionsToAdd: GlobalPermission[]): bluebirdPromise<User> {
    return bookshelf.transaction((_transaction: Transaction) => {
      return this._createUserWithPermissions(userInfo, permissionsToAdd, _transaction);
    });
  }

  public static updateUserDetails(userId: number, username: string, email: string, firstName: string, lastName: string): bluebirdPromise<User> {
    var updateValues = {};
    updateValues[User.usernameAttribute] = username;
    updateValues[User.emailAttribute] = email || null;
    updateValues[User.firstNameAttribute] = firstName;
    updateValues[User.lastNameAttribute] = lastName;

    return this._updateUser(userId, updateValues);
  }

  public static updateUserPassword(userId: number, newPasswordHash): bluebirdPromise<User> {
    var updateValues = {};
    updateValues[User.passwordHashAttribute] = newPasswordHash;

    return this._updateUser(userId, updateValues);
  }

  public static deleteUser(userId: number): bluebirdPromise<User> {
    return this._initializeUserByIdQuery(userId).destroy();
  }

  public static getUsers(): bluebirdPromise<User[]> {
    return new Users().fetch()
      .then((users: Collection<User>) => {
        return users.toArray();
      });
  }

  public static getUsersByPartialUsername(partialUsername: string): bluebirdPromise<User[]> {
    var likePartialUsername = this._createLikeQueryValue(partialUsername);

    return new Users().query((_queryBuilder: QueryBuilder) => {
      _queryBuilder.where(User.usernameAttribute, QuerySelectors.LIKE, likePartialUsername);
    }).fetch()
      .then((_usersCollection: Collection<User>) => _usersCollection.toArray());
  }

  public static addGlobalPermissions(userId: number, permissionsToAdd: GlobalPermission[]): bluebirdPromise<UserGlobalPermissions[]> {
    return bookshelf.transaction((_transaction: Transaction) => this._addGlobalPermissionInternal(userId, permissionsToAdd, _transaction));
  }

  public static removeGlobalPermissions(userId: number, permissionsToRemove: GlobalPermission[]): bluebirdPromise<UserGlobalPermissions[]> {
    return bookshelf.transaction((_transaction: Transaction) => this._removeGlobalPermissionInternal(userId, permissionsToRemove, _transaction));
  }

  public static getUserGlobalPermissions(userId: number): bluebirdPromise<GlobalPermission[]> {
    return this._fetchUserGlobalPermissions(userId)
      .then((usersGlobalPermissions: Collection<UserGlobalPermissions>) => {
        return this._convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions);
      });
  }

  public static getTeams(userId: number): bluebirdPromise<ITeamOfAUser[]> {
    var user: User = this._initializeUserByIdQuery(userId);

    return user.getTeams();
  }

  public static getUser(userId: number): bluebirdPromise<User> {
    return this._initializeUserByIdQuery(userId).fetch();
  }

  public static getUserByUsername(username: string): bluebirdPromise<User> {
    return this._initializeUserByUsernameQuery(username).fetch();
  }

  public static getUserByEmail(email: string): bluebirdPromise<User> {
    return this._initializeUserByEmailQuery(email).fetch();
  }

  private static _createUserWithPermissions(userInfo: IUserInfo, permissionsToAdd: GlobalPermission[], transaction: Transaction): bluebirdPromise<User> {
    var saveOptions: SaveOptions = {
      transacting: transaction
    }

    return new User(userInfo).save(null, saveOptions)
      .then((_user: User) => {
        return this._addGlobalPermissionInternal(_user.id, permissionsToAdd, transaction)
          .then(() => _user);
      });
  }

  private static _initializeUserByIdQuery(teamId: number): User {
    var queryCondition = {};
    queryCondition[User.idAttribute] = teamId;

    return new User(queryCondition);
  }

  private static _initializeUserByUsernameQuery(username: string): User {
    var queryCondition = {};
    queryCondition[User.usernameAttribute] = username;

    return new User(queryCondition);
  }

  private static _initializeUserByEmailQuery(email: string): User {
    var queryCondition = {};
    queryCondition[User.emailAttribute] = email;

    return new User(queryCondition);
  }

  private static _fetchUserGlobalPermissions(userId: number): bluebirdPromise<Collection<UserGlobalPermissions>> {
    var user: User = this._initializeUserByIdQuery(userId);

    return user.globalPermissions().fetch();
  }

  private static _convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions: Collection<UserGlobalPermissions>): GlobalPermission[] {
    var permissions: UserGlobalPermissions[] = usersGlobalPermissions.toArray();

    return _.map(permissions, _ => GlobalPermission[_.attributes.global_permissions]);
  }

  private static _addGlobalPermissionInternal(userId: number, permissionsToAdd: GlobalPermission[], transaction: Transaction): bluebirdPromise<UserGlobalPermissions[]> {
    var fetchOptions: FetchOptions = {
      withRelated: [User.relatedUserGlobalPermissionsAttribute],
      require: false,
      transacting: transaction
    };

    return this._initializeUserByIdQuery(userId)
      .fetch(fetchOptions)
      .then((user: User) => {
        if (!user) {
          var error = new Error();
          error.message = 'User does not exist';
          return bluebirdPromise.reject(error);
        }

        var existingPermissionsCollection: Collection<UserGlobalPermissions> = user.relations.globalPermissions;

        return this._addNotExistingGlobalPermissions(user.id,
          existingPermissionsCollection,
          permissionsToAdd,
          transaction);
      });
  }

  private static _removeGlobalPermissionInternal(userId: number, permissionsToRemove: GlobalPermission[], transaction: Transaction): bluebirdPromise<UserGlobalPermissions[]> {
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

    var deleteUserPermissionsPromise: bluebirdPromise<UserGlobalPermissions>[] =
      _.map(permissionsToDelete, _permission => _permission.destroy(destroyOptions));

    return bluebirdPromise.all(deleteUserPermissionsPromise);
  }

  private static _addNotExistingGlobalPermissions(userId: number,
    existingPermissionsCollection: Collection<UserGlobalPermissions>,
    permissionsToAdd: GlobalPermission[],
    transaction: Transaction): bluebirdPromise<UserGlobalPermissions[]> {

    var existingPermissions: GlobalPermission[] =
      this._convertPermissionsCollectionsToGlobalPermissions(existingPermissionsCollection);

    var newPermissions: GlobalPermission[] = _.difference(permissionsToAdd, existingPermissions);
    newPermissions = _.uniq(newPermissions);

    var newUserPermissions: UserGlobalPermissions[] =
      this._createUserGlobalPermission(userId, newPermissions);

    var saveOptions: SaveOptions = {
      transacting: transaction
    }

    var newUserPermissionsPromise: bluebirdPromise<UserGlobalPermissions>[] =
      _.map(newUserPermissions, _permission => _permission.save(null, saveOptions));

    return bluebirdPromise.all(newUserPermissionsPromise);
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

  private static _updateUser(userId: number, updateValues: any): bluebirdPromise<User> {
    var saveOptions: SaveOptions = {
      method: 'update'
    }

    return this._initializeUserByIdQuery(userId).fetch().then((_user: User) => {
      return _user.save(updateValues, saveOptions);
    });
  }

  private static _createLikeQueryValue(value: string): string {
    var fixedValue = this._fixValueForLikeQuery(value);
    console.log(fixedValue);
    return '%' + fixedValue + '%';
  }

  private static _fixValueForLikeQuery(value: string): string {
    var noLodash = StringManipulator.replaceAll(value, '_', '\\_');
    var noPercentage = StringManipulator.replaceAll(noLodash, '%', '\\%');

    return noPercentage;
  }
}
