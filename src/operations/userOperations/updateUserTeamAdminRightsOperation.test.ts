import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UpdateUserTeamAdminRightsOperation} from "./updateUserTeamAdminRightsOperation";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
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

describe('UpdateUserTeamAdminRightsOperation', () => {

  var teamOfTheUser: Team;
  var otherTeam: Team;
  var executingUser: User;
  var adminUser: User;
  var notAdminUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1')),
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team2'))
      ])).then((_teams: Team[]) => {
        [teamOfTheUser, otherTeam] = _teams;
      }).then(() => Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(3))
      ])).then((_users: User[]) => {
        [executingUser, adminUser, notAdminUser] = _users;
      }).then(() => {
        var adminTeamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, adminUser)
        adminTeamMemberInfo.is_admin = true;

        var notAdminTeamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, notAdminUser)
        adminTeamMemberInfo.is_admin = false;

        return Promise.all(
          [
            TeamsDataHandler.addTeamMember(adminTeamMemberInfo),
            TeamsDataHandler.addTeamMember(notAdminTeamMemberInfo)
          ]);
      })
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    function verifyTeamMemberAdminRights(modifiedUser: User, shouldBeAdmin: boolean, teamMembers: IUserOfATeam[]) {
      var teamMember: IUserOfATeam = _.find(teamMembers, _teamMember => _teamMember.user.id === modifiedUser.id);

      expect(teamMember.isAdmin).to.be.equal(shouldBeAdmin);
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

      it('not admin to admin should reject', () => {
        // Arrange
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, true, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('admin not to admin should reject', () => {
        // Arrange
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, false, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

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

      it('not admin to admin should set as admin', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
          });
      });

      it('admin to not admin should set as not admin', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
          });
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

      it('not admin to admin should set as admin', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
          });
      });

      it('admin to not admin should set as not admin', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
          });
      });

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('admin to not admin should reject', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('not admin to admin should reject', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('not admin to admin should set as admin', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
          });
      });

      it('admin to not admin should set as not admin', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
          });
      });

    });

    describe('executing user is a simple team member of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('admin to not admin should reject', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('admin to not admin should reject', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

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

      it('admin to not admin should reject', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('not admin to admin should reject', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

  });

});
