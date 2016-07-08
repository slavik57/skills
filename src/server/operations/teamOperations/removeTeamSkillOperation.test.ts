import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../../models/interfaces/iTeamSkillInfo";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {RemoveTeamSkillOperation} from "./removeTeamSkillOperation";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('RemoveTeamSkillOperation', () => {

  var teamOfTheSkill: Team;
  var otherTeam: Team;
  var executingUser: User;
  var skillToRemove: Skill;

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
        [teamOfTheSkill, otherTeam] = _teams;
      }).then(() => SkillsDataHandler.createSkill(ModelInfoMockFactory.createSkillInfo('skill1'), executingUser.id))
      .then((_skill: Skill) => {
        skillToRemove = _skill;
      }).then(() => {
        var teamSkillInfo: ITeamSkillInfo =
          ModelInfoMockFactory.createTeamSkillInfo(teamOfTheSkill, skillToRemove)

        return TeamsDataHandler.addTeamSkill(teamSkillInfo);
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

      it('removing skill should reject and not remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToRemove, _teamSkills);
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

      it('removing skill should remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToRemove, _teamSkills);
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

      it('removing skill shoud not remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToRemove, _teamSkills);
          });
      });

    });

    describe('executing user is a simple team member', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheSkill, executingUser);

        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('removing skill should succeed and remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToRemove, _teamSkills);
          });
      });

    });

    describe('executing user is a team admin', () => {

      beforeEach(() => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(teamOfTheSkill, executingUser);

        teamMemberInfo.is_admin = true;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });

      it('removing skill should remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamDoesNotHaveTheSkill(skillToRemove, _teamSkills);
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

      it('removing skill should reject and not remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToRemove, _teamSkills);
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

      it('removing skill should reject and not remove', () => {
        // Arrange
        var operation = new RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(teamOfTheSkill.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            verifyTeamHasTheSkill(skillToRemove, _teamSkills);
          });
      });

    });

  });

});
