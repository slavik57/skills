import {ITeamSkillInfo} from "./interfaces/iTeamSkillInfo";
import {ITeamInfo} from "./interfaces/iTeamInfo";
import {ISkillInfo} from "./interfaces/iSkillInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised';
import { Team, Teams } from './team';
import { Skill, Skills } from './skill';
import { TeamSkill, TeamSkills } from './teamSkill';

chai.use(chaiAsPromised);

describe('TeamSkill', () => {
  describe('new', () => {
    var skill1: Skill;
    var skill2: Skill;
    var team1: Team;

    function clearTables(): Promise<any> {
      return TeamSkills.clearAll()
        .then(() => Promise.all([
          Skills.clearAll(),
          Teams.clearAll()
        ]));
    }

    function createSkillInfo(skillName: string): ISkillInfo {
      return {
        name: skillName
      }
    }

    function createTeamInfo(teamName: string): ITeamInfo {
      return {
        name: teamName
      }
    }

    function createTeamSkillInfo(team: Team, skill: Skill): ITeamSkillInfo {
      return {
        team_id: team.id,
        skill_id: skill.id,
        upvotes: 0
      }
    }

    beforeEach(() => {
      return clearTables()
        .then(() => Promise.all([
          new Skill(createSkillInfo('skill1')).save(),
          new Skill(createSkillInfo('skill2')).save(),
          new Team(createTeamInfo('a')).save(),
        ]))
        .then((skillsAndTeams: any[]) => {
          skill1 = skillsAndTeams[0];
          skill2 = skillsAndTeams[1];
          team1 = skillsAndTeams[2];
        });
    });

    afterEach(() => {
      return clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var teamSkill = new TeamSkill();

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without team_id should return error', () => {
      /// Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      delete teamSkillInfo.team_id;

      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without skill_id should return error', () => {
      /// Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      delete teamSkillInfo.skill_id;

      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without upvotes should succeed', () => {
      /// Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      delete teamSkillInfo.upvotes;

      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.equal(teamSkill);
    });

    it('create with non integer team_id should return error', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      teamSkillInfo.team_id = 1.1;
      var teamMember = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer skill_id should return error', () => {
      // Arrange
      var teamMemberInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      teamMemberInfo.skill_id = 1.1;
      var teamSkill = new TeamSkill(teamMemberInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer upvotes should return error', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      teamSkillInfo.upvotes = 1.1;
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing team_id should return error', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      teamSkillInfo.team_id = team1.id + 1;
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing skill_id name should return error', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      teamSkillInfo.skill_id = skill1.id + skill2.id + 1;
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with existing team_id and skill_id should succeed', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      return expect(promise).to.eventually.equal(teamSkill);
    });

    it('create with existing team_id and skill_id should be fetched', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkill>) => {
          var teamSkill: TeamSkill = teamSkills.at(0);

          expect(teamSkills.size()).to.be.equal(1);
          expect(teamSkill.attributes.team_id).to.be.equal(teamSkillInfo.team_id);
          expect(teamSkill.attributes.skill_id).to.be.equal(teamSkillInfo.skill_id);
          expect(teamSkill.attributes.upvotes).to.be.equal(teamSkillInfo.upvotes);
        });
    });

    it('create with upvotes = 0 should be fetched correctly', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var upvotes = 0;
      teamSkillInfo.upvotes = upvotes;
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkill>) => {
          var teamSkill: TeamSkill = teamSkills.at(0);

          expect(teamSkills.size()).to.be.equal(1);
          expect(teamSkill.attributes.team_id).to.be.equal(teamSkillInfo.team_id);
          expect(teamSkill.attributes.skill_id).to.be.equal(teamSkillInfo.skill_id);
          expect(teamSkill.attributes.upvotes).to.be.equal(upvotes);
        });
    });

    it('create with upvotes = 11 should be fetched correctly', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var upvotes = 11;
      teamSkillInfo.upvotes = upvotes;
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkill>) => {
          var teamSkill: TeamSkill = teamSkills.at(0);

          expect(teamSkills.size()).to.be.equal(1);
          expect(teamSkill.attributes.team_id).to.be.equal(teamSkillInfo.team_id);
          expect(teamSkill.attributes.skill_id).to.be.equal(teamSkillInfo.skill_id);
          expect(teamSkill.attributes.upvotes).to.be.equal(upvotes);
        });
    });

    it('create without upvotes should be fetched correctly', () => {
      // Arrange
      var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      delete teamSkillInfo.upvotes;
      var teamSkill = new TeamSkill(teamSkillInfo);

      // Act
      var promise: Promise<TeamSkill> = teamSkill.save();

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkill>) => {
          var teamSkill: TeamSkill = teamSkills.at(0);

          expect(teamSkills.size()).to.be.equal(1);
          expect(teamSkill.attributes.team_id).to.be.equal(teamSkillInfo.team_id);
          expect(teamSkill.attributes.skill_id).to.be.equal(teamSkillInfo.skill_id);
          expect(teamSkill.attributes.upvotes).to.be.equal(0);
        });
    });

    it('create 2 different team skills should succeed', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team1, skill2);

      var teamSkill1 = new TeamSkill(teamSkillInfo1);
      var teamSkill2 = new TeamSkill(teamSkillInfo2);

      // Act
      var promise: Promise<TeamSkill> =
        teamSkill1.save()
          .then(() => teamSkill2.save());

      // Assert
      return expect(promise).to.eventually.equal(teamSkill2);
    });

    it('create 2 different team skills should be fetched', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team1, skill2);

      var teamSkill1 = new TeamSkill(teamSkillInfo1);
      var teamSkill2 = new TeamSkill(teamSkillInfo2);

      // Act
      var promise: Promise<TeamSkill> =
        teamSkill1.save()
          .then(() => teamSkill2.save());

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkill>) => {
          expect(teamSkills.size()).to.be.equal(2);
        });
    });

    it('create 2 same skills should return error', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);

      var teamSkill1 = new TeamSkill(teamSkillInfo1);
      var teamSkill2 = new TeamSkill(teamSkillInfo2);

      // Act
      var promise: Promise<TeamSkill> =
        teamSkill1.save()
          .then(() => teamSkill2.save());

      // Assert
      return expect(promise).to.eventually.rejected;
    });
  });
});

describe('TeamSkills', () => {
  describe('clearAll', () => {

    it('should clear all the team skills', () => {
      // Act
      var promise: Promise<void> = TeamSkills.clearAll();

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkill>) => {
          expect(teamSkills.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        TeamSkills.clearAll().then(() => TeamSkills.clearAll());

      // Assert
      var teamSkillsPromise =
        promise.then(() => new TeamSkills().fetch());

      return expect(teamSkillsPromise).to.eventually.fulfilled;
    });

  });
});
