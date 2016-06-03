import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised'
import {IUser, User, Users} from '../models/user';
import {UserDataHandler} from './userDataHandler';
import {IUserGlobalPermissions, UserGlobalPermissions, UsersGlobalPermissions, GlobalPermission} from '../models/usersGlobalPermissions';

describe('userDataHandler', () => {

  beforeEach(() => {
    return UsersGlobalPermissions.clearAll()
      .then(() => Users.clearAll());
  });

  afterEach(() => {
    return UsersGlobalPermissions.clearAll()
      .then(() => Users.clearAll());
  });

  function createUserInfo(userNumber: number): IUser {
    var userNumberString = userNumber.toString();

    return {
      username: userNumberString + ' name',
      password_hash: userNumberString + ' password',
      email: userNumberString + '@gmail.com',
      firstName: userNumberString + ' first name',
      lastName: userNumberString + ' last name'
    }
  }

  function verifyUserInfoAsync(actualUserPromise: Promise<User>,
    expectedUserInfo: IUser): Promise<void> {

    return expect(actualUserPromise).to.eventually.fulfilled
      .then((user: User) => {
        verifyUserInfo(user.attributes, expectedUserInfo);
      });
  }

  function verifyUserInfo(actual: IUser, expected: IUser): void {
    var actualCloned: IUser = _.clone(actual);
    var expectedCloned: IUser = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  describe('createUser', () => {

    it('should create user correctly', () => {
      // Act
      var userInfo: IUser = createUserInfo(1);
      var userPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Assert
      return verifyUserInfoAsync(userPromise, userInfo);
    });

  });

  describe('getUsers', () => {

    function verifyUsersInfoWithoutOrderAsync(actualUsersPromise: Promise<User[]>,
      expectedUsersInfo: IUser[]): Promise<void> {

      return expect(actualUsersPromise).to.eventually.fulfilled
        .then((users: User[]) => {

          var actualUserInfos = _.map(users, _user => _user.attributes);

          verifyUsersInfoWithoutOrder(actualUserInfos, expectedUsersInfo);
        });
    }

    function verifyUsersInfoWithoutOrder(actual: IUser[], expected: IUser[]): void {
      var actualOrdered = _.orderBy(actual, _info => _info.username);
      var expectedOrdered = _.orderBy(expected, _info => _info.username);

      expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

      for (var i = 0; i < expected.length; i++) {
        verifyUserInfo(actualOrdered[i], expectedOrdered[i]);
      }
    }

    it('no users should return empty', () => {
      // Act
      var usersPromose: Promise<User[]> = UserDataHandler.getUsers();

      // Assert
      var expectedUsersInfo: IUser[] = [];
      return verifyUsersInfoWithoutOrderAsync(usersPromose, expectedUsersInfo);
    });

    it('should return all created users', () => {
      // Arrange
      var userInfo1: IUser = createUserInfo(1);
      var userInfo2: IUser = createUserInfo(2);
      var userInfo3: IUser = createUserInfo(3);

      var createAllUsersPromise: Promise<any> =
        Promise.all([
          UserDataHandler.createUser(userInfo1),
          UserDataHandler.createUser(userInfo2),
          UserDataHandler.createUser(userInfo3)
        ]);

      // Act
      var usersPromose: Promise<User[]> =
        createAllUsersPromise.then(() => UserDataHandler.getUsers());

      // Assert
      var expectedUsersInfo: IUser[] = [userInfo1, userInfo2, userInfo3];
      return verifyUsersInfoWithoutOrderAsync(usersPromose, expectedUsersInfo);
    });

  });

  describe('getUserByUsername', () => {

    it('no such user and require is false should succeed with null', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUserByUsername('not existing', false);

      // Assert
      return expect(userPromise).to.eventually.be.null;
    });

    it('no such user and require is true should fail', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUserByUsername('not existing', true);

      // Assert
      return expect(userPromise).to.eventually.rejected;
    });

    it('user exists and require is false should return correct user', () => {
      // Arrange
      var userInfo1: IUser = createUserInfo(1);
      var userInfo2: IUser = createUserInfo(2);
      var userInfo3: IUser = createUserInfo(3);

      var createUsersPromise: Promise<any> =
        Promise.all([
          UserDataHandler.createUser(userInfo1),
          UserDataHandler.createUser(userInfo2),
          UserDataHandler.createUser(userInfo3)
        ]);

      // Act
      var userPromise: Promise<User> =
        createUsersPromise.then(() => UserDataHandler.getUserByUsername(userInfo2.username, false));

      // Assert
      return verifyUserInfoAsync(userPromise, userInfo2);
    });

    it('user exists and require is true should return correct user', () => {
      // Arrange
      var userInfo1: IUser = createUserInfo(1);
      var userInfo2: IUser = createUserInfo(2);
      var userInfo3: IUser = createUserInfo(3);

      var createUsersPromise: Promise<any> =
        Promise.all([
          UserDataHandler.createUser(userInfo1),
          UserDataHandler.createUser(userInfo2),
          UserDataHandler.createUser(userInfo3)
        ]);

      // Act
      var userPromise: Promise<User> =
        createUsersPromise.then(() => UserDataHandler.getUserByUsername(userInfo2.username, true));

      // Assert
      return verifyUserInfoAsync(userPromise, userInfo2);
    });

  });

  describe('getUserGlobalPermissions', () => {

    function verifyUserGlobalPermissionsAsync(actualPermissionsPromise: Promise<GlobalPermission[]>,
      expectedPermissions: GlobalPermission[]): Promise<void> {

      return expect(actualPermissionsPromise).to.eventually.fulfilled
        .then((actualPermissions: GlobalPermission[]) => {
          verifyUserGlobalPermissions(actualPermissions, expectedPermissions);
        });
    }

    function verifyUserGlobalPermissions(actual: GlobalPermission[], expected: GlobalPermission[]): void {
      var actualOrdered: GlobalPermission[] = actual.sort();
      var expectedOrdered: GlobalPermission[] = expected.sort();

      expect(actualOrdered).to.deep.equal(expectedOrdered);
    }

    function addUserPermissions(userInfo: IUser, permissions: GlobalPermission[]): Promise<any> {
      var permissionPromises: Promise<UserGlobalPermissions>[] = [];

      permissions.forEach((permission: GlobalPermission) => {
        var newPermission: IUserGlobalPermissions = {
          username: userInfo.username,
          global_permissions: GlobalPermission[permission]
        }

        var newPermissionPromise: Promise<UserGlobalPermissions> =
          new UserGlobalPermissions(newPermission).save();

        permissionPromises.push(newPermissionPromise);
      });

      return Promise.all(permissionPromises);
    }

    it('no such user should return empty permissions list', () => {
      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        UserDataHandler.getUserGlobalPermissions('not existing username');

      // Assert
      var expectedPermissions: GlobalPermission[] = [];
      return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
    });

    it('user exists but has no permissions should return empty permissions list', () => {
      // Assert
      var userInfo: IUser = createUserInfo(1);

      var createUserPromise: Promise<User> = UserDataHandler.createUser(userInfo);

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        createUserPromise.then(() => UserDataHandler.getUserGlobalPermissions(userInfo.username));

      // Assert
      var expectedPermissions: GlobalPermission[] = [];
      return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
    });

    it('user exists with permissions should return correct permissions list', () => {
      // Assert
      var userInfo: IUser = createUserInfo(1);
      var permissions: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var createUserPromise: Promise<User> = UserDataHandler.createUser(userInfo);
      var addUserPermissionsPromise: Promise<void> =
        createUserPromise.then(() => addUserPermissions(userInfo, permissions));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        createUserPromise.then(() => UserDataHandler.getUserGlobalPermissions(userInfo.username));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions);
    });

    it('multiple users exist with permissions should return correct permissions list', () => {
      // Assert
      var userInfo1: IUser = createUserInfo(1);
      var userInfo2: IUser = createUserInfo(2);
      var permissions1: GlobalPermission[] =
        [
          GlobalPermission.READER,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];
      var permissions2: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var createUserPromise1: Promise<User> = UserDataHandler.createUser(userInfo1);
      var createUserPromise2: Promise<User> = UserDataHandler.createUser(userInfo2);
      var addUserPermissionsPromise1: Promise<void> =
        createUserPromise1.then(() => addUserPermissions(userInfo1, permissions1));
      var addUserPermissionsPromise2: Promise<void> =
        createUserPromise1.then(() => addUserPermissions(userInfo2, permissions2));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
          .then(() => UserDataHandler.getUserGlobalPermissions(userInfo1.username));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions1);
    });

    it('multiple users exist with permissions should return correct permissions list 2', () => {
      // Assert
      var userInfo1: IUser = createUserInfo(1);
      var userInfo2: IUser = createUserInfo(2);
      var permissions1: GlobalPermission[] =
        [
          GlobalPermission.READER,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];
      var permissions2: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var createUserPromise1: Promise<User> = UserDataHandler.createUser(userInfo1);
      var createUserPromise2: Promise<User> = UserDataHandler.createUser(userInfo2);
      var addUserPermissionsPromise1: Promise<void> =
        createUserPromise1.then(() => addUserPermissions(userInfo1, permissions1));
      var addUserPermissionsPromise2: Promise<void> =
        createUserPromise1.then(() => addUserPermissions(userInfo2, permissions2));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
          .then(() => UserDataHandler.getUserGlobalPermissions(userInfo2.username));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions2);
    });

  });
});
