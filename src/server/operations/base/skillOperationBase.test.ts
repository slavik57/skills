import {GlobalPermission} from "../../models/enums/globalPermission";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {SkillOperationBase} from './skillOperationBase';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

class TestSkillOperationBase extends SkillOperationBase<any> {
  public wasExecuted = false;

  constructor(executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<any> {
    this.wasExecuted = true;
    return null;
  }

}

describe('SkillOperationBase', () => {

  var executingUser: User;
  var operation: TestSkillOperationBase;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;

        operation = new TestSkillOperationBase(executingUser.id);
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('canExecute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail', () => {
        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed', () => {
        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed', () => {
        // Act
        var resultPromise: bluebirdPromise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

  });

  describe('execute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail and not execute', () => {
        // Act
        var resultPromise: bluebirdPromise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

    });

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed and execute', () => {
        // Act
        var resultPromise: bluebirdPromise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed and execute', () => {
        // Act
        var resultPromise: bluebirdPromise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

  });

});
