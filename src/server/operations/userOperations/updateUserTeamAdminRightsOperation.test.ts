import {NotFoundError} from "../../../common/errors/notFoundError";
import {ErrorUtils} from "../../../common/errors/errorUtils";
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

  var team: Team;
  var otherTeam: Team;
  var executingUser: User;
  var adminUser: User;
  var notAdminUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(3))
      ])).then((_users: User[]) => {
        [executingUser, adminUser, notAdminUser] = _users;
      })
      .then(() => Promise.all([
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1'), adminUser.id),
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team2'), adminUser.id)
      ])).then((_teams: Team[]) => {
        [team, otherTeam] = _teams;
      }).then(() => {
        var adminTeamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(team, adminUser)
        adminTeamMemberInfo.is_admin = true;

        var notAdminTeamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(team, notAdminUser)
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

  describe('canUpdateUserRights', () => {

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
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

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

      it('should succeed', () => {
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

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

      it('should succeed', () => {
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should reject', () => {
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should succeed', () => {
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

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
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

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
        // Act
        var result: Promise<any> =
          UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

  });

  describe('execute', () => {

    function verifyTeamMemberAdminRights(modifiedUser: User, shouldBeAdmin: boolean, teamMembers: IUserOfATeam[]) {
      var teamMember: IUserOfATeam = _.find(teamMembers, _teamMember => _teamMember.user.id === modifiedUser.id);

      expect(teamMember.isAdmin).to.be.equal(shouldBeAdmin);
    }

    var sufficientPermissionsTests = () => {

      it('not admin to admin should set as admin', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, team.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(team.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
          });
      });

      it('admin to not admin should set as not admin', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, team.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamMembers(team.id))
          .then((_teamMembers: IUserOfATeam[]) => {
            verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
          });
      });

      describe('user to update is not part of the team', () => {

        var notInTeamUser: User;

        beforeEach(() => {
          return UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(12, 'notInTeam'))
            .then((_user: User) => {
              notInTeamUser = _user;
            })
        });

        it('user to update is not part of the team should fail correctly', () => {
          // Arrange
          var operation = new UpdateUserTeamAdminRightsOperation(notInTeamUser.id, team.id, false, executingUser.id);

          // Act
          var result: Promise<any> = operation.execute();

          // Assert
          return expect(result).to.eventually.rejected
            .then((_error: any) => {
              expect(ErrorUtils.isErrorOfType(_error, NotFoundError)).to.be.true;
            });
        });

      });

    };

    var insufficientPermissionsTests = () => {

      it('admin to not admin should reject', () => {
        // Arrange
        var shouldBeAdmin = false;
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, team.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('not admin to admin should reject', () => {
        // Arrange
        var shouldBeAdmin = true;
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, team.id, shouldBeAdmin, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
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

      it('not admin to admin should reject', () => {
        // Arrange
        var operation = new UpdateUserTeamAdminRightsOperation(notAdminUser.id, team.id, true, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('admin not to admin should reject', () => {
        // Arrange
        var operation = new UpdateUserTeamAdminRightsOperation(adminUser.id, team.id, false, executingUser.id);

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

      sufficientPermissionsTests();
    });

    describe('executing user is teams list admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      sufficientPermissionsTests();

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      insufficientPermissionsTests();

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      sufficientPermissionsTests();

    });

    describe('executing user is a simple team member of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      insufficientPermissionsTests();

    });

    describe('executing user is a team admin of another team', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      insufficientPermissionsTests();

    });

  });

});
