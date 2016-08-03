import {ModifyTeamOperationBase} from "./modifyTeamOperationBase";
// import {GetAllowedUserPermissionsToModifyOperation} from "../userOperations/getAllowedUserPermissionsToModifyOperation";
// import {ModifyUserPermissionsOperationBase} from "./modifyUserPermissionsOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
// import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

class TestModifyTeamOperationBase extends ModifyTeamOperationBase {
  public wasExecuted: boolean = false;

  constructor(executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<any> {
    this.wasExecuted = true;

    return null;
  }
}

describe('ModifyUserPermissionsOperationBase', () => {

  var executingUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
      ])).then((_users: User[]) => {
        [executingUser] = _users;
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

      it('should execute', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

      it('can execute should succeed', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

    describe('executing user is TEAMS_LIST_ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
      });

      it('should succeed', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          })
      });

      it('can execute should succeed', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
      });

      it('should fail and not execute', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('can execute should reject', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('executing user is READER', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.READER]);
      });

      it('should fail and not execute', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('can execute should reject', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('executing user is GUEST', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.GUEST]);
      });

      it('should fail and not execute', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('can execute should reject', () => {
        // Arrange
        var operation = new TestModifyTeamOperationBase(executingUser.id);

        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

  });

});
