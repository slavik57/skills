import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {GlobalPermission} from "../models/enums/globalPermission";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {AuthenticatedOperationBase} from './authenticatedOperationBase';

chai.use(chaiAsPromised);

class TestAuthenticatedOperation extends AuthenticatedOperationBase {
  public wasExecuted = false;
  public operationRequiredPermissionsToReturn: GlobalPermission[] = [];
  public executeOperationResult: any;

  constructor(userId: number) {
    super(userId);
  }

  public get actualUserId(): number { return this.userId; }

  protected get operationRequiredPermissions(): GlobalPermission[] {
    return this.operationRequiredPermissionsToReturn;
  }

  protected executeOperation(): void | Promise<any> {
    this.wasExecuted = true;

    return this.executeOperationResult;
  }
}

describe('AuthenticatedOperationBase', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('new', () => {

    it('should initialize properties correctly', () => {
      // Arrange
      var userId = 123456;

      // Act
      var operation = new TestAuthenticatedOperation(userId);

      // Assert
      expect(operation.actualUserId).to.be.equal(userId);
    });

  });

  describe('execute', () => {

    var user: User;

    beforeEach(() => {
      var userCreationPromise: Promise<any> =
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
          .then((_user: User) => {
            user = _user;
          });

      return userCreationPromise;
    });

    it('executing with not existing user id should fail', () => {
      // Arrange
      var userId = 12345;

      var operation = new TestAuthenticatedOperation(userId);

      // Act
      var executionPromise: Promise<any> = operation.execute();

      // Assert
      return expect(executionPromise).to.eventually.rejected;
    });

    it('executing with existing user id that has no global permissions should fail', () => {
      // Arrange
      var userCreationPromise: Promise<User> =
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1));

      // Act
      var executionPromise: Promise<any> =
        userCreationPromise.then((_user: User) => {
          return new TestAuthenticatedOperation(_user.id).execute();
        })

      // Assert
      return expect(executionPromise).to.eventually.rejected;
    });

    it('executing with existing user id that has no global permissions should not execute the operation', () => {
      // Arrange
      var operation = new TestAuthenticatedOperation(user.id);

      // Act
      var executionPromise: Promise<any> = operation.execute();

      // Assert
      return expect(executionPromise).to.eventually.rejected
        .then(() => {
          expect(operation.wasExecuted).to.be.false;
        });
    });

    it('executing with existing user id that has admin permissions should execute', () => {
      // Arrange
      var createAdminPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

      var operation = new TestAuthenticatedOperation(user.id);

      // Act
      var executionPromise: Promise<any> =
        createAdminPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.fulfilled
        .then(() => {
          expect(operation.wasExecuted).to.be.true;
        });
    });

    it('executing with existing user id that has insufficient permissions should fail and not execute', () => {
      // Arrange
      var uerPermissions: GlobalPermission[] =
        [
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.GUEST
        ];

      var createAdminPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

      var operation = new TestAuthenticatedOperation(user.id);
      operation.operationRequiredPermissionsToReturn =
        [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var executionPromise: Promise<any> =
        createAdminPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.rejected
        .then(() => {
          expect(operation.wasExecuted).to.be.false;
        });
    });

    it('executing with existing user id that has sufficient permissions should succeed and execute', () => {
      // Arrange
      var uerPermissions: GlobalPermission[] =
        [
          GlobalPermission.GUEST
        ];

      var createUserPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

      var operation = new TestAuthenticatedOperation(user.id);
      operation.operationRequiredPermissionsToReturn =
        [
          GlobalPermission.GUEST,
          GlobalPermission.READER
        ];

      // Act
      var executionPromise: Promise<any> =
        createUserPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.fulfilled
        .then(() => {
          expect(operation.wasExecuted).to.be.true;
        });
    });

    it('executing with existing user id that has admin permissions and operation returning resolving promise should execute and resolve the correct result', () => {
      // Arrange
      var createAdminPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

      var operation = new TestAuthenticatedOperation(user.id);

      var expectedResult = {};
      operation.executeOperationResult = Promise.resolve(expectedResult);

      // Act
      var executionPromise: Promise<any> =
        createAdminPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.fulfilled
        .then((_actualResult: any) => {
          expect(operation.wasExecuted).to.be.true;
          expect(_actualResult).to.be.equal(expectedResult);
        });
    });

    it('executing with existing user id that has admin permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
      // Arrange
      var createAdminPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

      var operation = new TestAuthenticatedOperation(user.id);

      var expectedError = {};
      operation.executeOperationResult = Promise.reject(expectedError);

      // Act
      var executionPromise: Promise<any> =
        createAdminPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.rejected
        .then((actualError: any) => {
          expect(operation.wasExecuted).to.be.true;
          expect(actualError).to.be.equal(expectedError);
        });
    });

    it('executing with existing user id that has sufficient permissions and operation returning resolving promise should execute and resolve the correct result', () => {
      // Arrange
      var uerPermissions: GlobalPermission[] =
        [
          GlobalPermission.GUEST
        ];

      var createUserPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

      var operation = new TestAuthenticatedOperation(user.id);
      operation.operationRequiredPermissionsToReturn =
        [
          GlobalPermission.GUEST,
          GlobalPermission.READER
        ];

      var expectedResult = {};
      operation.executeOperationResult = Promise.resolve(expectedResult);


      // Act
      var executionPromise: Promise<any> =
        createUserPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.fulfilled
        .then((_actualResult: any) => {
          expect(operation.wasExecuted).to.be.true;
          expect(_actualResult).to.be.equal(expectedResult);
        });
    });

    it('executing with existing user id that has sufficient permissions and operation returning rejecting promise should execite and reject with the correct error', () => {
      // Arrange
      var uerPermissions: GlobalPermission[] =
        [
          GlobalPermission.GUEST
        ];

      var createUserPermissions: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

      var operation = new TestAuthenticatedOperation(user.id);
      operation.operationRequiredPermissionsToReturn =
        [
          GlobalPermission.GUEST,
          GlobalPermission.READER
        ];

      var expectedError = {};
      operation.executeOperationResult = Promise.reject(expectedError);

      // Act
      var executionPromise: Promise<any> =
        createUserPermissions.then(() => operation.execute());

      // Assert
      return expect(executionPromise).to.eventually.rejected
        .then((_actualError: any) => {
          expect(operation.wasExecuted).to.be.true;
          expect(_actualError).to.be.equal(expectedError);
        });
    });

  });

});
