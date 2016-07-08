import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {User} from "../../models/user";
import {Team} from "../../models/team";
import {AddRemoveUserFromTeamOperationBase} from './addRemoveUserFromTeamOperationBase';
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised);

describe('AddRemoveUserFromTeamOperationBase', () => {

  var team: Team;
  var otherTeam: Team;
  var executingUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;
      })
      .then(() => Promise.all([
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1'), executingUser.id),
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team2'), executingUser.id)
      ])).then((_teams: Team[]) => {
        [team, otherTeam] = _teams;
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
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

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

      it('should fulfil', () => {
        // Arrange
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

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

      it('should fulfil', () => {
        // Arrange
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

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
        // Arrange
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

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

      it('should fulfil', () => {
        // Arrange
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

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
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

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
        var operation = new AddRemoveUserFromTeamOperationBase(team.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

  });

})
