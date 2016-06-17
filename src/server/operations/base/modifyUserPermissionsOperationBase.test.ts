import {GetAllowedUserPermissionsToModifyOperation} from "../userOperations/getAllowedUserPermissionsToModifyOperation";
import {ModifyUserPermissionsOperationBase} from "./modifyUserPermissionsOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

class TestModifyUserPermissionsOperationBase extends ModifyUserPermissionsOperationBase<any> {
  public wasExecuted: boolean = false;

  constructor(userIdToAddPermissionsTo: number,
    permissionsToModify: GlobalPermission[],
    executingUserId: number) {

    super(userIdToAddPermissionsTo, permissionsToModify, executingUserId);
  }

  protected doWork(): Promise<any> {
    this.wasExecuted = true;

    return null;
  }
}

describe('ModifyUserPermissionsOperationBase', () => {

  var userToModifyPermissionsOf: User;
  var executingUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
      ])).then((_users: User[]) => {
        [executingUser, userToModifyPermissionsOf] = _users;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
      });

      it('modifying all permissions should execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

      it('modifying all permissions the user can add should execute', () => {
        // Arrange
        var permissionsToModify: GlobalPermission[];
        var operation: TestModifyUserPermissionsOperationBase;

        var permissionsToModifyPromise: Promise<any> =
          new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
            .then((_permissions: GlobalPermission[]) => {
              permissionsToModify = _permissions;

              operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
                permissionsToModify,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToModifyPromise.then(() => operation.execute());

        // Assert

        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

    describe('executing user is TEAMS_LIST_ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
      });

      it('modifying TEAMS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          })
      });

      it('modifying SKILLS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying all permissions the user can add should add execute', () => {
        // Arrange
        var permissionsToModify: GlobalPermission[];
        var operation: TestModifyUserPermissionsOperationBase;

        var permissionsToModifyPromise: Promise<any> =
          new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
            .then((_permissions: GlobalPermission[]) => {
              permissionsToModify = _permissions;

              operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
                permissionsToModify,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToModifyPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
      });

      it('modifying SKILLS_LIST_ADMIN permissions should execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          })
      });

      it('modifying TEAMS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying all permissions the user can add should execute', () => {
        // Arrange
        var permissionsToModify: GlobalPermission[];
        var operation: TestModifyUserPermissionsOperationBase;

        var permissionsToModifyPromise: Promise<any> =
          new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
            .then((_permissions: GlobalPermission[]) => {
              permissionsToModify = _permissions;

              operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
                permissionsToModify,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToModifyPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

    describe('executing user is READER', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.READER]);
      });

      it('modifying TEAMS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying all permissions the user can add should execute', () => {
        // Arrange
        var permissionsToModify: GlobalPermission[];
        var operation: TestModifyUserPermissionsOperationBase;

        var permissionsToModifyPromise: Promise<any> =
          new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
            .then((_permissions: GlobalPermission[]) => {
              permissionsToModify = _permissions;

              operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
                permissionsToModify,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToModifyPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

    describe('executing user is GUEST', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.GUEST]);
      });

      it('modifying TEAMS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', () => {
        // Arrange
        var permissionsToModify = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
          permissionsToModify,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('modifying all permissions the user can add should execute', () => {
        // Arrange
        var permissionsToModify: GlobalPermission[];
        var operation: TestModifyUserPermissionsOperationBase;

        var permissionsToModifyPromise: Promise<any> =
          new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
            .then((_permissions: GlobalPermission[]) => {
              permissionsToModify = _permissions;

              operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id,
                permissionsToModify,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToModifyPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

  });

});
