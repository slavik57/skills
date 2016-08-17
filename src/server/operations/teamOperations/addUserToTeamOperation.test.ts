import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {ErrorUtils} from "../../../common/errors/errorUtils";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AddUserToTeamOperation} from "./addUserToTeamOperation";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {User} from "../../models/user";
import {Team} from "../../models/team";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('AddUserToTeamOperation', () => {

  var teamToAddTheUser: Team;
  var otherTeam: Team;
  var executingUser: User;
  var userToAdd: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
      ])).then((_users: User[]) => {
        [executingUser, userToAdd] = _users;
      })
      .then(() => Promise.all([
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1'), executingUser.id),
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team2'), executingUser.id)
      ])).then((_teams: Team[]) => {
        [teamToAddTheUser, otherTeam] = _teams;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('canExecute', () => {

    describe('executing user is not part of the team and has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.SKILLS_LIST_ADMIN,
            GlobalPermission.READER,
            GlobalPermission.GUEST
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions)
      });

      it('should reject', () => {
        // Arrange
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is global admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('add as admin should fulfil', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('add not as admin should fulfil', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('executing user is teams list admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('add as admin should fulfil', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('add not as admin should fulfil', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should reject', () => {
        // Arrange
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('add as admin should fulfil', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('add not as admin should fulfil', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('executing user is a simple team member of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should reject', () => {
        // Arrange
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is a team admin of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should reject', () => {
        // Arrange
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

  });

  describe('execute', () => {

    function verifyUserIsTeamMember(userToAdd: User, shouldBeAdmin: boolean, teamMembers: IUserOfATeam[]) {
      var teamMember: IUserOfATeam = _.find(teamMembers, _teamMember => _teamMember.user.id === userToAdd.id);

      expect(teamMember.isAdmin).to.be.equal(shouldBeAdmin);
    }

    var unauthorizedTests = () => {

      it('should reject', () => {
        // Arrange
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    };

    var authorizedTests = () => {

      it('add as admin should add user to the team correctly', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamToAddTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsTeamMember(userToAdd, shouldBeAdmin, _teamMembers);
          });
      });

      it('add not as admin should add user to the team correctly', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamToAddTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsTeamMember(userToAdd, shouldBeAdmin, _teamMembers);
          });
      });

      it('add not existing user should fail', () => {
        // Arrange
        var operation =
          new AddUserToTeamOperation('not existing username', teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, NotFoundError)).to.be.true;
          });
      });

      it('add a user that is already in the team should fail correctly', () => {
        // Arrange
        var existingTeamMemberInfo: ITeamMemberInfo = {
          team_id: teamToAddTheUser.id,
          user_id: userToAdd.id,
          is_admin: false
        };

        var addExistingTeamMemberPromise: Promise<any> =
          TeamsDataHandler.addTeamMember(existingTeamMemberInfo);

        var operation = new AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> =
          addExistingTeamMemberPromise
            .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.rejected
          .then((error: any) => {
            expect(ErrorUtils.isErrorOfType(error, AlreadyExistsError)).to.be.true;
          });
      });

    }

    describe('executing user is not part of the team and has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.SKILLS_LIST_ADMIN,
            GlobalPermission.READER,
            GlobalPermission.GUEST
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions)
      });

      unauthorizedTests();

    });

    describe('executing user is global admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      authorizedTests();

    });

    describe('executing user is teams list admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      authorizedTests();

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      unauthorizedTests();

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      authorizedTests();

    });

    describe('executing user is a simple team member of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      unauthorizedTests();

    });

    describe('executing user is a team admin of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      unauthorizedTests();

    });

  });

});
