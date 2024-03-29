import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {TeamOperationBase} from './teamOperationBase';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

class TestTeamOperationBase extends TeamOperationBase<any> {
  public wasExecuted = false;
  public operationPermissionsToReturn: GlobalPermission[] = [];
  public isRegularTeamMemberAlowedToExecuteToReturn: boolean = false;
  public executeOperationResultToReturn: any;
  public executeOperationErrorToThrow: any;

  constructor(teamId: number, userId: number) {
    super(teamId, userId);
  }

  public get actualUserId(): number { return this.executingUserId; }
  public get actualTeamId(): number { return this.teamId; }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return this.operationPermissionsToReturn;
  }

  protected get isRegularTeamMemberAlowedToExecute(): boolean { return this.isRegularTeamMemberAlowedToExecuteToReturn; }

  protected doWork(): bluebirdPromise<any> {
    this.wasExecuted = true;

    if (this.executeOperationErrorToThrow) {
      throw this.executeOperationErrorToThrow;
    }

    return this.executeOperationResultToReturn;
  }
}

describe('TeamOperationBase', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('new', () => {

    it('should initialize properties correctly', () => {
      // Arrange
      var userId = 123456;
      var teamId = 54321;

      // Act
      var operation = new TestTeamOperationBase(teamId, userId);

      // Assert
      expect(operation.actualUserId).to.be.equal(userId);
      expect(operation.actualTeamId).to.be.equal(teamId);
    });

  });

  describe('execute', () => {

    var team: Team;

    beforeEach(() => {
      var user: User;

      var teamCreationPromise: bluebirdPromise<void> =
        EnvironmentCleaner.clearTables()
          .then(() => EnvironmentDirtifier.createUsers(1))
          .then((_users: User[]) => {
            [user] = _users;
          })
          .then(() => TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1'), user.id))
          .then((_team: Team) => {
            team = _team;
          });

      return teamCreationPromise;
    });

    describe('in the team', () => {

      var user: User;
      var operation: TestTeamOperationBase;

      beforeEach(() => {

        var userCreationPromise: bluebirdPromise<any> =
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
            .then((_user: User) => {
              user = _user;

              operation = new TestTeamOperationBase(team.id, user.id);
            });

        return userCreationPromise.then(() => {
          var teamMemberInfo: ITeamMemberInfo =
            ModelInfoMockFactory.createTeamMemberInfo(team, user);

          return TeamsDataHandler.addTeamMember(teamMemberInfo);
        });
      });

      describe('not team admin', () => {

        beforeEach(() => {
          return TeamsDataHandler.setAdminRights(team.id, user.id, false);
        });

        describe('regular team member cannot execute', () => {

          beforeEach(() => {
            operation.isRegularTeamMemberAlowedToExecuteToReturn = false;
          });

          it('has no global permissions should fail and not execute', () => {
            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then(() => {
                expect(operation.wasExecuted).to.be.false;
              });
          });

          it('has global admin permissions should execute', () => {
            // Arrange
            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('has global admin permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions should fail and not execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then(() => {
                expect(operation.wasExecuted).to.be.false;
              });
          });

          it('has sufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

        });

        describe('regular team member can execute', () => {

          beforeEach(() => {
            operation.isRegularTeamMemberAlowedToExecuteToReturn = true;
          });

          it('has no global permissions should succeed and execute', () => {
            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions should execute', () => {
            // Arrange
            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('has global admin permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has sufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions and operation returning resolving promise should execute and return correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has insufficient global permissions and operation returning rejecting promise should fail and return correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions and operation returning result should execute and return correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has insufficient global permissions and operation throwing error should fail and return correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

        });

      });

      describe('team admin', () => {

        beforeEach(() => {
          return TeamsDataHandler.setAdminRights(team.id, user.id, true);
        });

        describe('regular team member cannot execute', () => {

          beforeEach(() => {
            operation.isRegularTeamMemberAlowedToExecuteToReturn = false;
          });

          it('has no global permissions should succeed and execute', () => {
            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions should execute', () => {
            // Arrange
            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('has global admin permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has insufficient global permissions and operation returning resolving promise should execute and return correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has insufficient global permissions and operation returning rejecting promise should fail and return correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions and operation returning result should execute and return correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var userPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, userPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has insufficient global permissions and operation throwing error should fail and return correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var userPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, userPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

        });

        describe('regular team member can execute', () => {

          beforeEach(() => {
            operation.isRegularTeamMemberAlowedToExecuteToReturn = true;
          });

          it('has no global permissions should succeed and execute', () => {
            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions should execute', () => {
            // Arrange
            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('has global admin permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has global admin permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var createAdminPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createAdminPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('has insufficient global permissions and operation returning resolving promise should execute and return correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has insufficient global permissions and operation returning rejecting promise should fail and return correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has insufficient global permissions and operation returning result should execute and return correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has insufficient global permissions and operation throwing error should fail and return correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            operation.operationPermissionsToReturn =
              [
                GlobalPermission.TEAMS_LIST_ADMIN,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.SKILLS_LIST_ADMIN,
                GlobalPermission.GUEST
              ];

            var addGlobalPermissionsPromise: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              addGlobalPermissionsPromise.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions should succeed and execute', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then(() => {
                expect(operation.wasExecuted).to.be.true;
              });
          });

          it('operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError).to.be.equal(expectedError);
              });
          });

          it('operation returning result should execute and resolve the correct result', () => {
            // Arrange
            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            // Act
            var executionPromise: bluebirdPromise<any> = operation.execute();

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(actualError.innerError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationResultToReturn = Promise.reject(expectedError);

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError).to.be.equal(expectedError);
              });
          });

          it('has sufficient global permissions and operation returning result should execute and resolve the correct result', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedResult = {};
            operation.executeOperationResultToReturn = expectedResult;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.fulfilled
              .then((_actualResult: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualResult).to.be.equal(expectedResult);
              });
          });

          it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', () => {
            // Arrange
            operation.operationPermissionsToReturn =
              [
                GlobalPermission.GUEST,
                GlobalPermission.READER
              ];

            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;

            var uerPermissions: GlobalPermission[] =
              [
                GlobalPermission.GUEST
              ];

            var createUserPermissions: bluebirdPromise<any> =
              UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

            // Act
            var executionPromise: bluebirdPromise<any> =
              createUserPermissions.then(() => operation.execute());

            // Assert
            return expect(executionPromise).to.eventually.rejected
              .then((_actualError: any) => {
                expect(operation.wasExecuted).to.be.true;
                expect(_actualError.innerError).to.be.equal(expectedError);
              });
          });

        });

      });

    });

    describe('not in the team', () => {

      var user: User;
      var operation: TestTeamOperationBase;

      beforeEach(() => {

        var userCreationPromise: bluebirdPromise<any> =
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
            .then((_user: User) => {
              user = _user;

              operation = new TestTeamOperationBase(team.id, user.id);
            });

        return userCreationPromise;
      });

      it('has no global permissions should fail', () => {
        // Act
        var executionPromise: bluebirdPromise<any> =
          new TestTeamOperationBase(team.id, user.id).execute();

        // Assert
        return expect(executionPromise).to.eventually.rejected;
      });

      it('has global admin permissions should execute', () => {
        // Arrange
        var createAdminPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createAdminPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

      it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', () => {
        // Arrange
        var expectedResult = {};
        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

        var createAdminPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createAdminPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.fulfilled
          .then((_actualResult: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualResult).to.be.equal(expectedResult);
          });
      });

      it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
        // Arrange
        var expectedError = {};
        operation.executeOperationResultToReturn = Promise.reject(expectedError);

        var createAdminPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createAdminPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then((actualError: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(actualError).to.be.equal(expectedError);
          });
      });

      it('has global admin permissions and operation returning result should execute and resolve the correct result', () => {
        // Arrange
        var expectedResult = {};
        operation.executeOperationResultToReturn = expectedResult;

        var createAdminPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createAdminPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.fulfilled
          .then((_actualResult: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualResult).to.be.equal(expectedResult);
          });
      });

      it('has global admin permissions and operation throwing error should execute and reject with the correct error', () => {
        // Arrange
        var expectedError = {};
        operation.executeOperationErrorToThrow = expectedError

        var createAdminPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createAdminPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then((actualError: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(actualError.innerError).to.be.equal(expectedError);
          });
      });

      it('has insufficient global permissions should fail and not execute', () => {
        // Arrange
        operation.operationPermissionsToReturn =
          [
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.READER
          ];

        var uerPermissions: GlobalPermission[] =
          [
            GlobalPermission.SKILLS_LIST_ADMIN,
            GlobalPermission.GUEST
          ];

        var addGlobalPermissionsPromise: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

        // Act
        var executionPromise: bluebirdPromise<any> =
          addGlobalPermissionsPromise.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('has sufficient global permissions should succeed and execute', () => {
        // Arrange
        operation.operationPermissionsToReturn =
          [
            GlobalPermission.GUEST,
            GlobalPermission.READER
          ];

        var uerPermissions: GlobalPermission[] =
          [
            GlobalPermission.GUEST
          ];

        var createUserPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createUserPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

      it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', () => {
        // Arrange
        operation.operationPermissionsToReturn =
          [
            GlobalPermission.GUEST,
            GlobalPermission.READER
          ];

        var expectedResult = {};
        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);

        var uerPermissions: GlobalPermission[] =
          [
            GlobalPermission.GUEST
          ];

        var createUserPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createUserPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.fulfilled
          .then((_actualResult: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualResult).to.be.equal(expectedResult);
          });
      });

      it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', () => {
        // Arrange
        operation.operationPermissionsToReturn =
          [
            GlobalPermission.GUEST,
            GlobalPermission.READER
          ];

        var expectedError = {};
        operation.executeOperationResultToReturn = Promise.reject(expectedError);

        var uerPermissions: GlobalPermission[] =
          [
            GlobalPermission.GUEST
          ];

        var createUserPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createUserPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then((_actualError: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualError).to.be.equal(expectedError);
          });
      });

      it('has sufficient global permissions and operation returning result should execute and resolve the correct result', () => {
        // Arrange
        operation.operationPermissionsToReturn =
          [
            GlobalPermission.GUEST,
            GlobalPermission.READER
          ];

        var expectedResult = {};
        operation.executeOperationResultToReturn = expectedResult;

        var uerPermissions: GlobalPermission[] =
          [
            GlobalPermission.GUEST
          ];

        var createUserPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createUserPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.fulfilled
          .then((_actualResult: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualResult).to.be.equal(expectedResult);
          });
      });

      it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', () => {
        // Arrange
        operation.operationPermissionsToReturn =
          [
            GlobalPermission.GUEST,
            GlobalPermission.READER
          ];

        var expectedError = {};
        operation.executeOperationErrorToThrow = expectedError;

        var uerPermissions: GlobalPermission[] =
          [
            GlobalPermission.GUEST
          ];

        var createUserPermissions: bluebirdPromise<any> =
          UserDataHandler.addGlobalPermissions(user.id, uerPermissions);

        // Act
        var executionPromise: bluebirdPromise<any> =
          createUserPermissions.then(() => operation.execute());

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then((_actualError: any) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualError.innerError).to.be.equal(expectedError);
          });
      });

    });

    describe('not existing user or team', () => {

      var notExistingUserId = 123456;
      var notExistingTeamId = 654321;

      it('not existing user id should not execute', () => {
        // Arrange
        var operation = new TestTeamOperationBase(team.id, notExistingUserId);

        // Act
        var executionPromise: bluebirdPromise<any> = operation.execute();

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

      it('not existing team id should not execute', () => {
        // Arrange
        var userCreationPromise: bluebirdPromise<User> =
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(3));

        var operation: TestTeamOperationBase;

        // Act
        var executionPromise: bluebirdPromise<any> =
          userCreationPromise.then((_user: User) => {
            operation = new TestTeamOperationBase(notExistingTeamId, _user.id);

            return operation.execute();
          });

        // Assert
        return expect(executionPromise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

    });

  });

});
