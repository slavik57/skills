import {IPrerequisitesOfASkill} from "../models/interfaces/iPrerequisitesOfASkill";
import {ITeamsOfASkill} from "../models/interfaces/iTeamsOfASkill";
import {TeamSkillUpvote} from "../models/teamSkillUpvote";
import {ITestModels} from "../testUtils/interfaces/iTestModels";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
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

  describe('deleteSkill', () => {

    var testModels: ITestModels;

    beforeEach(() => {
      return EnvironmentDirtifier.fillAllTables()
        .then((_testModels: ITestModels) => {
          testModels = _testModels;
        });
    });

    it('not existing skill should not fail', () => {
      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(9999);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing skill should not fail', () => {
      // Arrange
      var skillToDelete = testModels.skills[0];

      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(skillToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing skill should remove the skill', () => {
      // Arrange
      var skillToDelete = testModels.skills[0];

      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(skillToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => SkillsDataHandler.getSkill(skillToDelete.id))
        .then((skill: Skill) => {
          expect(skill).to.be.null;
        })
    });

    it('existing skill should remove the relevant skill prerequisites', () => {
      // Arrange
      var skillToDelete = testModels.skills[0];

      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(skillToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => SkillsDataHandler.getSkillsPrerequisites())
        .then((_prerequisites: SkillPrerequisite[]) => {
          return _.map(_prerequisites, _ => _.attributes.skill_id);
        })
        .then((_skillIds: number[]) => {
          expect(_skillIds).not.to.contain(skillToDelete.id);
        });
    });

    it('existing skill should remove the relevant skill contributors', () => {
      // Arrange
      var skillToDelete = testModels.skills[0];

      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(skillToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => SkillsDataHandler.getSkillsPrerequisites())
        .then((_prerequisites: SkillPrerequisite[]) => {
          return _.map(_prerequisites, _ => _.attributes.skill_prerequisite_id);
        })
        .then((_skillIds: number[]) => {
          expect(_skillIds).not.to.contain(skillToDelete.id);
        });
    });

    it('existing skill should remove the relevant team skills', () => {
      // Arrange
      var skillToDelete = testModels.skills[0];

      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(skillToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkills().fetch())
        .then((_teamSkillsCollection: Collection<TeamSkill>) => _teamSkillsCollection.toArray())
        .then((_teamSkills: TeamSkill[]) => {
          return _.map(_teamSkills, _ => _.attributes.skill_id);
        })
        .then((_skillIds: number[]) => {
          expect(_skillIds).not.to.contain(skillToDelete.id);
        });
    });

    it('existing skill should remove the relevant team skill upvotes', () => {
      // Arrange
      var skillToDelete = testModels.skills[0];

      // Act
      var promise: Promise<Skill> =
        SkillsDataHandler.deleteSkill(skillToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkillUpvotes().fetch())
        .then((_teamSkillUpvotesCollection: Collection<TeamSkillUpvote>) => _teamSkillUpvotesCollection.toArray())
        .then((_teamSkillsUpvotes: TeamSkillUpvote[]) => {
          return _.map(_teamSkillsUpvotes, _ => _.attributes.team_skill_id);
        })
        .then((_teamSkillIds: number[]) => {
          return _.filter(testModels.teamSkills, _ => _teamSkillIds.indexOf(_.id) >= 0);
        })
        .then((_teamSkills: TeamSkill[]) => {
          return _.map(_teamSkills, _ => _.attributes.skill_id);
        })
        .then((_skillIds: number[]) => {
          expect(_skillIds).not.to.contain(skillToDelete.id);
        });
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

  describe('removeSkillPrerequisite', () => {

    var testModels: ITestModels;

    beforeEach(() => {
      return EnvironmentDirtifier.fillAllTables()
        .then((_testModels: ITestModels) => {
          testModels = _testModels;
        });
    });

    it('not existing skill should not fail', () => {
      // Arrange
      var prerequisiteToRemove: SkillPrerequisite = testModels.skillPrerequisites[0];
      var skillPrerequisiteId: number = prerequisiteToRemove.attributes.skill_prerequisite_id;

      // Act
      var promise: Promise<SkillPrerequisite> =
        SkillsDataHandler.removeSkillPrerequisite(9999, skillPrerequisiteId);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('not existing skill prerequisite should not fail', () => {
      // Arrange
      var prerequisiteToRemove: SkillPrerequisite = testModels.skillPrerequisites[0];
      var skillId: number = prerequisiteToRemove.attributes.skill_id;

      // Act
      var promise: Promise<SkillPrerequisite> =
        SkillsDataHandler.removeSkillPrerequisite(skillId, 9999);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing skill prerequisite should remove the prerequisite', () => {
      // Arrange
      var prerequisiteToRemove: SkillPrerequisite = testModels.skillPrerequisites[0];
      var skillId: number = prerequisiteToRemove.attributes.skill_id;
      var skillPrerequisiteId: number = prerequisiteToRemove.attributes.skill_prerequisite_id;

      // Act
      var promise: Promise<SkillPrerequisite> =
        SkillsDataHandler.removeSkillPrerequisite(skillId, skillPrerequisiteId);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => SkillsDataHandler.getSkillsPrerequisites())
        .then((_prerequisites: SkillPrerequisite[]) => {
          return _.map(_prerequisites, _ => _.id);
        })
        .then((_prerequisitesIds: number[]) => {
          expect(_prerequisitesIds).not.to.contain(prerequisiteToRemove.id);
        });
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

  describe('getSkillsToPrerequisitesMap', () => {

    function createSkillPrerequisites(skillsToPrerequisites: IPrerequisitesOfASkill[]): Promise<SkillPrerequisite[]> {
      var skillPrerequisitePromises: Promise<SkillPrerequisite>[] = [];

      skillsToPrerequisites.forEach((skillPrerequisite: IPrerequisitesOfASkill) => {
        skillPrerequisite.prerequisiteSkillIds.forEach((_prerequisiteSkillId: number) => {

          var skillPrerequisiteInfo: ISkillPrerequisiteInfo = {
            skill_id: skillPrerequisite.skill.id,
            skill_prerequisite_id: _prerequisiteSkillId
          }

          var skillPrerequisitePromise: Promise<SkillPrerequisite> =
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);

          skillPrerequisitePromises.push(skillPrerequisitePromise);

        });
      });

      return Promise.all(skillPrerequisitePromises);
    }

    function verifySkillsToPrerequisites(actual: IPrerequisitesOfASkill[], expected: IPrerequisitesOfASkill[]): void {
      expect(actual.length).to.be.equal(expected.length);

      var actualSkills: Skill[] = _.map(actual, _ => _.skill);
      var expectedSkills: Skill[] = _.map(actual, _ => _.skill);

      ModelVerificator.verifyMultipleModelsEqualById(actualSkills, expectedSkills);

      verifySkillsToPrerequisitesHasCorrectPrerequisitesForEachSkill(actual, expected);
    }

    function verifySkillsToPrerequisitesHasCorrectPrerequisitesForEachSkill(actual: IPrerequisitesOfASkill[], expected: IPrerequisitesOfASkill[]): void {
      var actualSorted: IPrerequisitesOfASkill[] = _.orderBy(actual, _ => _.skill.id);
      var expectedSorted: IPrerequisitesOfASkill[] = _.orderBy(expected, _ => _.skill.id);

      for (var i = 0; i < expected.length; i++) {
        var actualSkillTeamIds: number[] = actualSorted[0].prerequisiteSkillIds;
        var expectedSkillTeamIds: number[] = expectedSorted[0].prerequisiteSkillIds;

        expect(actualSkillTeamIds.sort()).to.deep.equal(expectedSkillTeamIds.sort());
      }
    }

    it('no skills should return empty mapping', () => {
      // Act
      var promise: Promise<IPrerequisitesOfASkill[]> =
        SkillsDataHandler.getSkillsToPrerequisitesMap();

      // Arrange
      return expect(promise).to.eventually.deep.equal([]);
    });

    it('has skills without teams should return correct result', () => {
      // Arrange
      var numberOfSkills = 5;
      var skills: Skill[];
      var expectedSkillsToPrerequisites: IPrerequisitesOfASkill[];

      var addSkillsPromise: Promise<Skill[]> =
        EnvironmentDirtifier.createSkills(numberOfSkills)
          .then((_skills: Skill[]) => {
            skills = _skills;

            expectedSkillsToPrerequisites =
              _.map(_skills, _skill => {
                return <IPrerequisitesOfASkill>{
                  skill: _skill,
                  prerequisiteSkillIds: []
                }
              });

            return _skills;

          });

      // Act
      var promise: Promise<IPrerequisitesOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getSkillsToPrerequisitesMap());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_skillsToPrerequisites: IPrerequisitesOfASkill[]) => {
          verifySkillsToPrerequisites(_skillsToPrerequisites, expectedSkillsToPrerequisites);
        });
    });

    it('has skills with teams knowing them should return correct result', () => {
      // Arrange
      var numberOfSkills = 5;
      var skills: Skill[];
      var addSkillsPromise: Promise<Skill[]> =
        EnvironmentDirtifier.createSkills(numberOfSkills)
          .then((_skills: Skill[]) => {
            skills = _skills;
            return _skills;
          });

      var expectedSkillsToPrerequisites: IPrerequisitesOfASkill[];

      var addSkillPrerequisitesPromise: Promise<SkillPrerequisite[]> =
        addSkillsPromise
          .then(() => {
            expectedSkillsToPrerequisites =
              [
                { skill: skills[0], prerequisiteSkillIds: [skills[1].id, skills[2].id, skills[3].id, skills[4].id] },
                { skill: skills[1], prerequisiteSkillIds: [skills[0].id, skills[2].id, skills[4].id] },
                { skill: skills[2], prerequisiteSkillIds: [skills[1].id, skills[3].id] },
                { skill: skills[3], prerequisiteSkillIds: [skills[1].id, skills[2].id, skills[4].id] },
                { skill: skills[4], prerequisiteSkillIds: [skills[1].id, skills[2].id, skills[3].id] },
              ];
          })
          .then(() => createSkillPrerequisites(expectedSkillsToPrerequisites));

      // Act
      var promise: Promise<IPrerequisitesOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getSkillsToPrerequisitesMap());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_skillsToPrerequisites: IPrerequisitesOfASkill[]) => {
          verifySkillsToPrerequisites(_skillsToPrerequisites, expectedSkillsToPrerequisites);
        });
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

  describe('getTeamsOfSkills', () => {

    function createTeamSkills(skillsToTeams: ITeamsOfASkill[]): Promise<TeamSkill[]> {
      var teamSkillPromises: Promise<TeamSkill>[] = [];

      skillsToTeams.forEach((_teamsOfASkill: ITeamsOfASkill) => {
        _teamsOfASkill.teamsIds.forEach((_teamId: number) => {

          var teamSkillInfo: ITeamSkillInfo = {
            team_id: _teamId,
            skill_id: _teamsOfASkill.skill.id
          }

          var teamSkillPromise: Promise<TeamSkill> =
            TeamsDataHandler.addTeamSkill(teamSkillInfo);

          teamSkillPromises.push(teamSkillPromise);

        });
      });

      return Promise.all(teamSkillPromises);
    }

    function verifySkillsToTeams(actual: ITeamsOfASkill[], expected: ITeamsOfASkill[]): void {
      expect(actual.length).to.be.equal(expected.length);

      var actualSkills: Skill[] = _.map(actual, _ => _.skill);
      var expectedSkills: Skill[] = _.map(actual, _ => _.skill);

      ModelVerificator.verifyMultipleModelsEqualById(actualSkills, expectedSkills);

      verifySkillsToTeamsHasCorrectTeamsForEachSkill(actual, expected);
    }

    function verifySkillsToTeamsHasCorrectTeamsForEachSkill(actual: ITeamsOfASkill[], expected: ITeamsOfASkill[]): void {
      var actualSorted: ITeamsOfASkill[] = _.orderBy(actual, _ => _.skill.id);
      var expectedSorted: ITeamsOfASkill[] = _.orderBy(expected, _ => _.skill.id);

      for (var i = 0; i < expected.length; i++) {
        var actualSkillTeamIds: number[] = actualSorted[0].teamsIds;
        var expectedSkillTeamIds: number[] = expectedSorted[0].teamsIds;

        expect(actualSkillTeamIds.sort()).to.deep.equal(expectedSkillTeamIds.sort());
      }
    }

    it('no skills should return empty mapping', () => {
      // Act
      var promise: Promise<ITeamsOfASkill[]> =
        SkillsDataHandler.getTeamsOfSkills();

      // Arrange
      return expect(promise).to.eventually.deep.equal([]);
    });

    it('has skills without teams should return correct result', () => {
      // Arrange
      var numberOfSkills = 5;
      var skills: Skill[];
      var expectedSkillsToTeams: ITeamsOfASkill[];

      var addSkillsPromise: Promise<Skill[]> =
        EnvironmentDirtifier.createSkills(numberOfSkills)
          .then((_skills: Skill[]) => {
            skills = _skills;

            expectedSkillsToTeams =
              _.map(_skills, _skill => {
                return <ITeamsOfASkill>{
                  skill: _skill,
                  teamsIds: []
                }
              });

            return _skills;

          });

      // Act
      var promise: Promise<ITeamsOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeamsOfSkills());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_skillsToTeams: ITeamsOfASkill[]) => {
          verifySkillsToTeams(_skillsToTeams, expectedSkillsToTeams);
        });
    });

    it('has skills with teams knowing them should return correct result', () => {
      // Arrange
      var numberOfSkills = 3;
      var skills: Skill[];
      var addSkillsPromise: Promise<Skill[]> =
        EnvironmentDirtifier.createSkills(numberOfSkills)
          .then((_skills: Skill[]) => {
            skills = _skills;
            return _skills;
          });

      var numberOfTeams = 5;
      var teams: Team[];
      var addTeamsPromise: Promise<Team[]> =
        EnvironmentDirtifier.createTeams(numberOfTeams)
          .then((_teams: Team[]) => {
            teams = _teams;
            return _teams;
          });

      var expectedSkillsToTeams: ITeamsOfASkill[];

      var addTeamSkillsPromise: Promise<TeamSkill[]> =
        Promise.all([addSkillsPromise, addTeamsPromise])
          .then(() => {
            expectedSkillsToTeams =
              [
                { skill: skills[0], teamsIds: [teams[0].id, teams[1].id, teams[2].id, teams[3].id, teams[4].id] },
                { skill: skills[1], teamsIds: [teams[0].id, teams[2].id, teams[4].id] },
                { skill: skills[2], teamsIds: [teams[1].id, teams[3].id] },
              ];
          })
          .then(() => createTeamSkills(expectedSkillsToTeams));

      // Act
      var promise: Promise<ITeamsOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeamsOfSkills());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_skillsToTeams: ITeamsOfASkill[]) => {
          verifySkillsToTeams(_skillsToTeams, expectedSkillsToTeams);
        });
    });

  });

});
