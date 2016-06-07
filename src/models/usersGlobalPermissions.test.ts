import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {GlobalPermission} from "./enums/globalPermission";
import {IUserGlobalPermissions} from "./interfaces/iUserGlobalPermissions";
import {IUserInfo} from "./interfaces/iUserInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { User, Users } from './user';
import { UserGlobalPermissions, UsersGlobalPermissions } from './usersGlobalPermissions';

chai.use(chaiAsPromised);

describe('UserGlobalPermissions', () => {
  describe('new', () => {
    var validUserInfo: IUserInfo;
    var validUserGlobalPermissions: IUserGlobalPermissions;

    beforeEach(() => {
      validUserInfo = {
        username: 'slavik57',
        password_hash: 'some hash',
        email: 's@gmail.com',
        firstName: 'Slava',
        lastName: 'Shp'
      };

      return EnvironmentCleaner.clearTables()
        .then(() => new User(validUserInfo).save())
        .then((user: User) => {
          validUserGlobalPermissions = {
            user_id: user.id,
            global_permissions: GlobalPermission[GlobalPermission.ADMIN]
          }
        });
    });

    afterEach(() => {
      return EnvironmentCleaner.clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var permissions = new UserGlobalPermissions();

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without user_id should return error', () => {
      /// Arrange
      delete validUserGlobalPermissions.user_id;
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without global_permissions should return error', () => {
      /// Arrange
      delete validUserGlobalPermissions.global_permissions;
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer user_id should return error', () => {
      /// Arrange
      validUserGlobalPermissions.user_id = 1.2;
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing user_id should return error', () => {
      /// Arrange
      validUserGlobalPermissions.user_id = validUserGlobalPermissions.user_id + 1;
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with existing user_id should succeed', () => {
      /// Arrange
      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> = permissions.save();

      // Assert
      return expect(promise).to.eventually.equal(permissions);
    });

    it('create with existing user_id should be fetched', () => {
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

    it('create 2 different permissions with existing user_id should succeed', () => {
      /// Arrange
      validUserGlobalPermissions.global_permissions = GlobalPermission[GlobalPermission.ADMIN];

      var otherUserGlobalPermissions: IUserGlobalPermissions = {
        user_id: validUserGlobalPermissions.user_id,
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

    it('create 2 different permissions with existing user_id should be fetched', () => {
      /// Arrange
      validUserGlobalPermissions.global_permissions = GlobalPermission[GlobalPermission.ADMIN];

      var otherUserGlobalPermissions: IUserGlobalPermissions = {
        user_id: validUserGlobalPermissions.user_id,
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
        user_id: validUserGlobalPermissions.user_id,
        global_permissions: validUserGlobalPermissions.global_permissions
      }

      var permissions = new UserGlobalPermissions(validUserGlobalPermissions);
      var otherPermissions = new UserGlobalPermissions(otherUserGlobalPermissions);

      // Act
      var promise: Promise<UserGlobalPermissions> =
        permissions.save()
          .then(() => otherPermissions.save());

      // Assert
      return expect(promise).to.eventually.rejected;
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
