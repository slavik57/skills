import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoComparers} from "../testUtils/modelInfoComparers";
import {ModelVerificator} from "../testUtils/modelVerificator";
import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {TeamSkillUpvotes} from "../models/teamSkillUpvote";
import {TeamSkill, TeamSkills} from "../models/teamSkill";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {TeamsDataHandler} from "./teamsDataHandler";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {Team, Teams} from "../models/team";
import {ITeamOfASkill} from "../models/interfaces/iTeamOfASkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised'
import {Skill, Skills} from '../models/skill';
import {SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';
import {SkillsDataHandler} from './skillsDataHandler';
import {UserDataHandler} from './userDataHandler';
import {User, Users} from '../models/user';

chai.use(chaiAsPromised);

describe('SkillsDataHandler', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('createSkill', () => {

    it('should create a skill correctly', () => {
      // Act
      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('1');
      var skillPromise: Promise<Skill> =
        SkillsDataHandler.createSkill(skillInfo);

      // Assert
      return ModelVerificator.verifyModelInfoAsync(skillPromise, skillInfo);
    });

  });

  describe('getSkill', () => {

    it('no such skill should return null', () => {
      // Act
      var skillPromise: Promise<Skill> =
        SkillsDataHandler.getSkill(1234);

      // Assert
      return expect(skillPromise).to.eventually.null;
    });

    it('skill exists should return correct skill', () => {
      // Arrange
      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('1');
      var createSkillPromise: Promise<Skill> =
        SkillsDataHandler.createSkill(skillInfo);

      // Act
      var getSkillPromise: Promise<Skill> =
        createSkillPromise.then((skill: Skill) => SkillsDataHandler.getSkill(skill.id));

      // Assert
      return ModelVerificator.verifyModelInfoAsync(getSkillPromise, skillInfo);
    });

  });

  describe('getSkills', () => {

    it('no skills should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> = SkillsDataHandler.getSkills();

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillsInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('should return all created skills', () => {
      // Arrange
      var skillInfo1: ISkillInfo = ModelInfoMockFactory.createSkillInfo('1');
      var skillInfo2: ISkillInfo = ModelInfoMockFactory.createSkillInfo('2');
      var skillInfo3: ISkillInfo = ModelInfoMockFactory.createSkillInfo('3');

      var createAllSkillsPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2),
          SkillsDataHandler.createSkill(skillInfo3)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillsPromise.then(() => SkillsDataHandler.getSkills());

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [skillInfo1, skillInfo2, skillInfo3];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillsInfo,
        ModelInfoComparers.compareSkillInfos);
    });

  });

  describe('addSkillPrerequisite', () => {

    it('should create a skillPrerequisite', () => {
      // Act
      var skillInfo1: ISkillInfo = ModelInfoMockFactory.createSkillInfo('1');
      var skillInfo2: ISkillInfo = ModelInfoMockFactory.createSkillInfo('2');

      var createAllSkillsPromise =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2)
        ]);

      var skillPrerequisitePromise: Promise<SkillPrerequisite> =
        createAllSkillsPromise.then((skills: Skill[]) => {
          var skill1 = skills[0];
          var skill2 = skills[1];

          var skillPrerequisiteInfo: ISkillPrerequisiteInfo =
            ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);

          return SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
        });

      // Assert
      return expect(skillPrerequisitePromise).to.eventually.fulfilled;
    });

  });

  describe('getSkillsPrerequisites', () => {

    it('no skill prerequisites should return empty', () => {
      // Act
      var prerequisitesPromise: Promise<SkillPrerequisite[]> = SkillsDataHandler.getSkillsPrerequisites();

      // Assert
      var expectedPrerequisitesInfo: ISkillPrerequisiteInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(prerequisitesPromise,
        expectedPrerequisitesInfo,
        ModelInfoComparers.compareSkillPrerequisiteInfos);
    });

    it('should return all created skill prerequisites', () => {
      // Arrange
      var skillInfo1: ISkillInfo = ModelInfoMockFactory.createSkillInfo('1');
      var skillInfo2: ISkillInfo = ModelInfoMockFactory.createSkillInfo('2');

      var createAllSkillsPromise =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2)
        ]);

      var skillPrerequisiteInfo1: ISkillPrerequisiteInfo;
      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo;

      var createAllSkillPrerequisitesPromise: Promise<any> =
        createAllSkillsPromise.then((skills: Skill[]) => {
          var skill1: Skill = skills[0];
          var skill2: Skill = skills[1];

          skillPrerequisiteInfo1 = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
          skillPrerequisiteInfo2 = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);

          return Promise.all([
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo1),
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo2),
          ])
        });

      // Act
      var skillPrerequisitesPromise: Promise<SkillPrerequisite[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillsPrerequisites());

      // Assert
      return skillPrerequisitesPromise.then(() => {
        var expectedSkillPrerequisitesInfos: ISkillPrerequisiteInfo[] = [skillPrerequisiteInfo1, skillPrerequisiteInfo2];

        return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillPrerequisitesPromise,
          expectedSkillPrerequisitesInfos,
          ModelInfoComparers.compareSkillPrerequisiteInfos);
      });
    });

  });

  describe('getSkillPrerequisites', () => {

    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;
    var skillInfo3: ISkillInfo;

    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    beforeEach(() => {
      skillInfo1 = ModelInfoMockFactory.createSkillInfo('1');
      skillInfo2 = ModelInfoMockFactory.createSkillInfo('2');
      skillInfo3 = ModelInfoMockFactory.createSkillInfo('3');

      return Promise.all([
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        SkillsDataHandler.createSkill(skillInfo3)
      ]).then((skills: Skill[]) => {
        skill1 = skills[0];
        skill2 = skills[1];
        skill3 = skills[2];
      });
    });

    it('no such skill should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillPrerequisites(99999);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('no skill prerequisites should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillPrerequisites(skill1.id);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('should return all existing skill prerequisites', () => {
      // Arrange
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillPrerequisites(skill1.id));

      // Assert
      var expectedSkillsInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillsInfos,
        ModelInfoComparers.compareSkillInfos);
    });

    it('should return all existing skill prerequisites and not return other prerequisites', () => {
      // Arrange
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3);

      var skill2PrerequisiteInfo: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2),
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillPrerequisites(skill1.id));

      // Assert
      var expectedSkillsInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillsInfos,
        ModelInfoComparers.compareSkillInfos);
    });

  });

  describe('getSkillContributions', () => {

    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;
    var skillInfo3: ISkillInfo;

    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    beforeEach(() => {
      skillInfo1 = ModelInfoMockFactory.createSkillInfo('1');
      skillInfo2 = ModelInfoMockFactory.createSkillInfo('2');
      skillInfo3 = ModelInfoMockFactory.createSkillInfo('3');

      return Promise.all([
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        SkillsDataHandler.createSkill(skillInfo3)
      ]).then((skills: Skill[]) => {
        skill1 = skills[0];
        skill2 = skills[1];
        skill3 = skills[2];
      });
    });

    it('no such skill should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillContributions(9999999);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('no skill prerequisites should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillContributions(skill1.id);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('no skill prerequisites leading to skill should return empty', () => {
      // Act
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
        ]);

      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(
          () => SkillsDataHandler.getSkillContributions(skill1.id));

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('should return all existing skills with prerequisites of this skill', () => {
      // Arrange
      var skill2PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
      var skill3PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill3, skill1);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillContributions(skill1.id));

      // Assert
      var expectedSkillInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillInfos,
        ModelInfoComparers.compareSkillInfos);
    });

    it('should return all existing skill with prerequisites of this skill and not return other skills', () => {
      // Arrange
      var skill2PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
      var skill3PrerequisiteInfo1: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill3, skill1);

      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillContributions(skill1.id));

      // Assert
      var expectedSkillInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillInfos,
        ModelInfoComparers.compareSkillInfos);
    });

  });

  describe('getTeams', () => {

    interface ITeamIdToUpvotes {
      teamId: number;
      upvotingUserIds: number[];
    }

    function verifyTeamUpvotingUsersAsync(actualTeamsOfSkillPromise: Promise<ITeamOfASkill[]>,
      expectedSkillUpdvotes: ITeamIdToUpvotes[]): Promise<void> {

      return expect(actualTeamsOfSkillPromise).to.eventually.fulfilled
        .then((actualTeams: ITeamOfASkill[]) => {
          var orderedActualTeams: ITeamOfASkill[] = _.orderBy(actualTeams, _ => _.team.id);
          var actualUpvodtingUserIds: number[][] = _.map(orderedActualTeams, _ => _.upvotingUserIds.sort());

          var orderedExpectedUpvotes: ITeamIdToUpvotes[] = _.orderBy(expectedSkillUpdvotes, _ => _.teamId);
          var expectedUpvotingUserIds: number[][] = _.map(orderedExpectedUpvotes, _ => _.upvotingUserIds.sort());

          expect(actualUpvodtingUserIds).to.deep.equal(expectedUpvotingUserIds);
        });
    }

    var teamInfo1: ITeamInfo;
    var teamInfo2: ITeamInfo;
    var teamInfo3: ITeamInfo;
    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;

    var team1: Team;
    var team2: Team;
    var team3: Team;
    var skill1: Skill;
    var skill2: Skill;

    var userInfo1: IUserInfo;
    var userInfo2: IUserInfo;
    var user1: User;
    var user2: User;

    beforeEach(() => {
      teamInfo1 = ModelInfoMockFactory.createTeamInfo('a');
      teamInfo2 = ModelInfoMockFactory.createTeamInfo('b');
      teamInfo3 = ModelInfoMockFactory.createTeamInfo('c');

      skillInfo1 = ModelInfoMockFactory.createSkillInfo('1');
      skillInfo2 = ModelInfoMockFactory.createSkillInfo('2');

      userInfo1 = ModelInfoMockFactory.createUserInfo(1);
      userInfo2 = ModelInfoMockFactory.createUserInfo(2);

      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        TeamsDataHandler.createTeam(teamInfo3),
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ]).then((results: any[]) => {
        team1 = results[0];
        team2 = results[1];
        team3 = results[2];
        skill1 = results[3];
        skill2 = results[4];
        user1 = results[5];
        user2 = results[6];
      });
    });

    it('no such skill should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        SkillsDataHandler.getTeams(99999);

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('skill exists but has no teams should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        SkillsDataHandler.getTeams(skill1.id);

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('skill exists with teams should return correct teams', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);

      // Assert
      var addSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2)
        ]);

      // Act
      var teamsPromise: Promise<Team[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeams(skill1.id))
          .then((teamsOfASkill: ITeamOfASkill[]) => {
            return _.map(teamsOfASkill, _ => _.team);
          });

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise,
        expectedTeams,
        ModelInfoComparers.compareTeamInfos);
    });

    it('skill exists with teams should return correct upvoting user ids', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
      var teamSkillInfo3: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team3, skill1);

      // Assert
      var addSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeams(skill1.id));

      // Assert
      var expectedSkillUpvotes: ITeamIdToUpvotes[] =
        [
          { teamId: teamSkillInfo1.team_id, upvotingUserIds: [] },
          { teamId: teamSkillInfo2.team_id, upvotingUserIds: [] },
          { teamId: teamSkillInfo3.team_id, upvotingUserIds: [] }
        ];
      return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
    });

    it('multiple skills exist with teams should return correct teams', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);

      var teamSkillInfo3: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);

      // Assert
      var addSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3)
        ]);

      // Act
      var teamsPromise: Promise<Team[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeams(skill1.id))
          .then((teamsOfASkill: ITeamOfASkill[]) => {
            return _.map(teamsOfASkill, _ => _.team);
          });

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise,
        expectedTeams,
        ModelInfoComparers.compareTeamInfos);
    });

    it('skill exists with teams with upvotes should return correct upvoting user ids', () => {
      // Arrange
      var team1SkillInfo: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var team2SkillInfo: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
      var team3SkillInfo: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team3, skill1);

      var addSkillsAndUpvote: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(team1SkillInfo),
          TeamsDataHandler.addTeamSkill(team2SkillInfo),
          TeamsDataHandler.addTeamSkill(team3SkillInfo)
        ]).then((teamSkills: TeamSkill[]) => {
          var [team1Skill, team2Skill, team3Skill] = teamSkills;
          return Promise.all([
            TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user1.id),
            TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user2.id),
            TeamsDataHandler.upvoteTeamSkill(team2Skill.id, user2.id),
          ])
        });

      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        addSkillsAndUpvote.then(() => SkillsDataHandler.getTeams(skill1.id));

      // Assert
      var expectedSkillUpvotes: ITeamIdToUpvotes[] =
        [
          { teamId: team1.id, upvotingUserIds: [user1.id, user2.id] },
          { teamId: team2.id, upvotingUserIds: [user2.id] },
          { teamId: team3.id, upvotingUserIds: [] }
        ];
      return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
    });

  });

});
