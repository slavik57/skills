import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { IUser, User, Users } from './user';
import { IUserGlobalPermissions, UserGlobalPermissions, UsersGlobalPermissions, GlobalPermission } from './usersGlobalPermissions';

chai.use(chaiAsPromised);

describe('UserGlobalPermissions', () => {
  describe('new', () => {
    var validUserInfo: IUser;
    var validUserGlobalPermissions: IUserGlobalPermissions;

    function clearTables(): Promise<any> {
      return UsersGlobalPermissions.clearAll()
        .then(() => Users.clearAll());
    }

    beforeEach((done: Function) => {
      validUserInfo = {
        username: 'slavik57',
        password_hash: 'some hash',
        email: 's@gmail.com',
        firstName: 'Slava',
        lastName: 'Shp'
      };

      clearTables()
        .then(() => new User(validUserInfo).save())
        .then(() => done());

      validUserGlobalPermissions = {
        username: validUserInfo.username,
        global_permissions: GlobalPermission[GlobalPermission.ADMIN]
      }

    });

    afterEach((done: Function) => {
      clearTables()
        .then(() => done());
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var permissions = new UserGlobalPermissions();

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create without username should return error', () => {
      /// Arrange
      delete validUserGlobalPermissions.username;
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create without global_permissions should return error', () => {
      /// Arrange
      delete validUserGlobalPermissions.global_permissions;
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with empty username should return error', () => {
      /// Arrange
      validUserGlobalPermissions.username = '';
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non existing username should return error', () => {
      /// Arrange
      validUserGlobalPermissions.username = 'not existing username';
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with existing username should succeed', () => {
      /// Arrange
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.equal(permissions);
    });

    it('create with existing username should be fetched', () => {
      /// Arrange
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      var permissionsPromise =
        promise.then(() => new UsersGlobalPermissions().fetch());

      return expect(permissionsPromise).to.eventually.fulfilled
        .then((usersPermissions: Collection<UserGlobalPermissions>) => {
          expect(usersPermissions.size()).to.be.equal(1);
        });
    });

    it('create 2 different permissions with existing username should succeed', () => {
      /// Arrange
      validUserGlobalPermissions.global_permissions = GlobalPermission[GlobalPermission.ADMIN];

      var otherUserGlobalPermissions: IUserGlobalPermissions = {
        username: validUserGlobalPermissions.username,
        global_permissions: GlobalPermission[GlobalPermission.READER]
      };

      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);
      var otherPermissions = new UserGlobalPermissions(otherUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> =
        permissions.save()
          .then(() => otherPermissions.save());

      // Assert
      return expect(promise).to.eventually.equal(otherPermissions);
    });

    it('create 2 different permissions with existing username should be fetched', () => {
      /// Arrange
      validUserGlobalPermissions.global_permissions = GlobalPermission[GlobalPermission.ADMIN];

      var otherUserGlobalPermissions: IUserGlobalPermissions = {
        username: validUserGlobalPermissions.username,
        global_permissions: GlobalPermission[GlobalPermission.READER]
      };

      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);
      var otherPermissions = new UserGlobalPermissions(otherUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> =
        permissions.save()
          .then(() => otherPermissions.save());

      // Assert
      var permissionsPromise =
        promise.then(() => new UsersGlobalPermissions().fetch());

      return expect(permissionsPromise).to.eventually.fulfilled
        .then((usersPermissions: Collection<UserGlobalPermissions>) => {
          expect(usersPermissions.size()).to.be.equal(2);
        });
    });

    it('create 2 same permissions with existing username should return error', () => {
      /// Arrange
      var otherUserGlobalPermissions: IUserGlobalPermissions = {
        username: validUserGlobalPermissions.username,
        global_permissions: validUserGlobalPermissions.global_permissions
      }

      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);
      var otherPermissions = new UserGlobalPermissions(otherUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> =
        permissions.save()
          .then(() => otherPermissions.save());

      // Assert
      return expect(promise).to.be.rejected;
    });
  });
});

describe('UsersGlobalPermissions', () => {
  describe('clearAll', () => {

    it('should clear all the users', () => {
      // Act
      var promise: Promise<void> = UsersGlobalPermissions.clearAll();

      // Assert
      var usersPermissionsPromise =
        promise.then(() => new UsersGlobalPermissions().fetch());

      return expect(usersPermissionsPromise).to.eventually.fulfilled
        .then((userPermissions: Collection<UserGlobalPermissions>) => {
          expect(userPermissions.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        UsersGlobalPermissions.clearAll().then(() => UsersGlobalPermissions.clearAll());

      // Assert
      var usersPermissionsPromise =
        promise.then(() => new UsersGlobalPermissions().fetch());

      return expect(usersPermissionsPromise).to.eventually.fulfilled;
    });

  });
});
