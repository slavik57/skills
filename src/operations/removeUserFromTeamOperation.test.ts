import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {GlobalPermission} from "../models/enums/globalPermission";
import {RemoveUserFromTeamOperation} from "./removeUserFromTeamOperation";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
import {User} from "../models/user";
import {Team} from "../models/team";
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

    function verifyUserIsNotInTheTeam(modifiedUser: User, teamMembers: IUserOfATeam[]) {
      var teamMember: IUserOfATeam = _.find(teamMembers, _teamMember => _teamMember.user.id === modifiedUser.id);

      expect(teamMember).to.be.undefined;
    }

    function verifyUserIsInTheTeam(modifiedUser: User, teamMembers: IUserOfATeam[]) {
      var teamMember: IUserOfATeam = _.find(teamMembers, _teamMember => _teamMember.user.id === modifiedUser.id);

      expect(teamMember).to.not.be.undefined;
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

      it('removing not admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(notAdminUser, _teamMembers);
          });
      });

      it('removing admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(adminUser, _teamMembers);
          });
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

      it('removing not admin user should remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsNotInTheTeam(notAdminUser, _teamMembers);
          });
      });

      it('removing admin user should remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsNotInTheTeam(adminUser, _teamMembers);
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

      it('removing not admin user shoud remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsNotInTheTeam(notAdminUser, _teamMembers);
          });
      });

      it('removing admin user shoud remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsNotInTheTeam(adminUser, _teamMembers);
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

      it('removing admin user should reject and not remove', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(adminUser, _teamMembers);
          });
      });

      it('removing not admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(notAdminUser, _teamMembers);
          });
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('removing not admin user should remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsNotInTheTeam(notAdminUser, _teamMembers);
          });
      });

      it('removing admin user should remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsNotInTheTeam(adminUser, _teamMembers);
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

      it('removing admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(adminUser, _teamMembers);
          });
      });

      it('removing not admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(notAdminUser, _teamMembers);
          });
      });

    });

    describe('executing user is a team admin of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('removing admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(adminUser, _teamMembers);
          });
      });

      it('removing not admin user should reject and not remove', () => {
        // Arrange
        var operation = new RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamMembers(teamOfTheUser.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyUserIsInTheTeam(notAdminUser, _teamMembers);
          });
      });

    });

  });

});
