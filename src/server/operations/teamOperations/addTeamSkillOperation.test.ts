import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../../models/interfaces/iTeamSkillInfo";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AddTeamSkillOperation} from "./addTeamSkillOperation";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('AddTeamSkillOperation', () => {

  var teamToAddTheSkillTo: Team;
  var otherTeam: Team;
  var executingUser: User;
  var skillToAdd: Skill;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1')),
        TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team2'))
      ])).then((_teams: Team[]) => {
        [teamToAddTheSkillTo, otherTeam] = _teams;
      }).then(() => SkillsDataHandler.createSkill(ModelInfoMockFactory.createSkillInfo('skill1')))
      .then((_skill: Skill) => {
        skillToAdd = _skill;
      }).then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    function verifyTeamDoesNotHaveTheSkill(modifiedSkill: Skill, teamSkills: ISkillOfATeam[]) {
      var teamSkill: ISkillOfATeam = _.find(teamSkills, _teamSkill => _teamSkill.skill.id === modifiedSkill.id);

      expect(teamSkill).to.be.undefined;
    }

    function verifyTeamHasTheSkill(modifiedSkill: Skill, teamSkills: ISkillOfATeam[]) {
      var teamSkill: ISkillOfATeam = _.find(teamSkills, _teamSkill => _teamSkill.skill.id === modifiedSkill.id);

      expect(teamSkill).to.not.be.undefined;
    }

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

      it('adding skill should reject and not add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToAdd, _teamSkills);
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

      it('adding skill should add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToAdd, _teamSkills);
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

      it('adding skill shoud not add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToAdd, _teamSkills);
          });
      });

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheSkillTo, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('adding skill should succeed and add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToAdd, _teamSkills);
          });
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheSkillTo, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('adding skill should add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToAdd, _teamSkills);
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

      it('adding skill should reject and not add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToAdd, _teamSkills);
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

      it('adding skill should reject and not add', () => {
        // Arrange
        var operation = new AddTeamSkillOperation(skillToAdd.id, teamToAddTheSkillTo.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamToAddTheSkillTo.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToAdd, _teamSkills);
          });
      });

    });

  });

});
