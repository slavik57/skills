import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../../models/interfaces/iTeamSkillInfo";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AddRemoveTeamSkillOperationBase} from "./addRemoveTeamSkillOperationBase";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('AddRemoveTeamSkillOperationBase', () => {

  var teamToAddTheSkillTo: Team;
  var otherTeam: Team;
  var executingUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1')),
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team2'))
      ])).then((_teams: Team[]) => {
        [teamToAddTheSkillTo, otherTeam] = _teams;
      }).then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;
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
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN,
            GlobalPermission.READER,
            GlobalPermission.GUEST
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions)
      });

      it('should reject', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

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

      it('should succeed', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

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

      it('shoud fail', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheSkillTo, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should succeed', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheSkillTo, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('should succeed', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

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

      it('should fail', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

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

      it('should fail', () => {
        // Arrange
        var operation = new AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

  });

});
