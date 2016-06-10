import {GlobalPermission} from "../../models/enums/globalPermission";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {SkillOperationBase} from './skillOperationBase';

chai.use(chaiAsPromised);

class TestSkillOperationBase extends SkillOperationBase {
  public wasExecuted = false;

  constructor(executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): void | Promise<any> {
    this.wasExecuted = true;
  }

}

describe('SkillOperationBase', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;
    var operation: TestSkillOperationBase;

    beforeEach(() => {
      var userCreationPromise: Promise<any> =
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
          .then((_user: User) => {
            executingUser = _user;

            operation = new TestSkillOperationBase(executingUser.id);
          });

      return userCreationPromise;
    });

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
        var resultPromise: Promise<any> = operation.execute();

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
        var resultPromise: Promise<any> = operation.execute();

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
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

    });

  });

});
