import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised'
import {ISkillInfo, Skill, Skills} from '../models/skill';
import {ISkillPrerequisiteInfo, SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';
import {SkillsDataHandler} from './skillsDataHandler';

describe('SkillsDataHandler', () => {

  function clearTables(): Promise<any> {
    return SkillPrerequisites.clearAll()
      .then(() => Skills.clearAll());
  }

  beforeEach(() => {
    return clearTables();
  });

  afterEach(() => {
    return clearTables();
  });

  function createSkillInfo(skillNumber: number): ISkillInfo {
    var skillNumberString = skillNumber.toString();

    return {
      name: 'name ' + skillNumberString
    }
  }

  function verifySkillInfoAsync(actualSkillPromise: Promise<Skill>,
    expectedSkillInfo: ISkillInfo): Promise<void> {

    return expect(actualSkillPromise).to.eventually.fulfilled
      .then((skill: Skill) => {
        verifySkillInfo(skill.attributes, expectedSkillInfo);
      });
  }

  function verifySkillInfo(actual: ISkillInfo, expected: ISkillInfo): void {
    var actualCloned: ISkillInfo = _.clone(actual);
    var expectedCloned: ISkillInfo = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  function createSkillPrerequisiteInfo(skill: Skill, skillPrerequisite: Skill): ISkillPrerequisiteInfo {
    return {
      skill_id: skill.id,
      skill_prerequisite_id: skillPrerequisite.id
    }
  }

  function verifySkillPrerequisiteInfoAsync(actualSkillPrerequisitePromise: Promise<SkillPrerequisite>,
    expectedSkillPrerequisiteInfo: ISkillPrerequisiteInfo): Promise<void> {

    return expect(actualSkillPrerequisitePromise).to.eventually.fulfilled
      .then((skillPrerequisite: SkillPrerequisite) => {
        verifySkillPrerequisiteInfo(skillPrerequisite.attributes, expectedSkillPrerequisiteInfo);
      });
  }

  function verifySkillPrerequisiteInfo(actual: ISkillPrerequisiteInfo, expected: ISkillPrerequisiteInfo): void {
    var actualCloned: ISkillPrerequisiteInfo = _.clone(actual);
    var expectedCloned: ISkillPrerequisiteInfo = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  function verifySkillPrerequisitesInfoWithoutOrderAsync(actualSkillPrerequisitesPromise: Promise<SkillPrerequisite[]>,
    expectedSkillPrerequisitesInfo: ISkillPrerequisiteInfo[]): Promise<void> {

    return expect(actualSkillPrerequisitesPromise).to.eventually.fulfilled
      .then((skillPrerequisites: SkillPrerequisite[]) => {

        var actualSkillPrerequisitesInfos = _.map(skillPrerequisites, _ => _.attributes);

        verifyPrerequisitesInfoWithoutOrder(actualSkillPrerequisitesInfos, expectedSkillPrerequisitesInfo);
      });
  }

  function verifyPrerequisitesInfoWithoutOrder(actual: ISkillPrerequisiteInfo[], expected: ISkillPrerequisiteInfo[]): void {
    var actualOrdered = _.orderBy(actual, _ => _.skill_id);
    var expectedOrdered = _.orderBy(expected, _ => _.skill_id);

    expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

    for (var i = 0; i < expected.length; i++) {
      verifySkillPrerequisiteInfo(actualOrdered[i], expectedOrdered[i]);
    }
  }

  function verifySkillsInfoWithoutOrderAsync(actualSkillsPromise: Promise<Skill[]>,
    expectedSkillsInfo: ISkillInfo[]): Promise<void> {

    return expect(actualSkillsPromise).to.eventually.fulfilled
      .then((skills: Skill[]) => {

        var actualSkillInfos = _.map(skills, _ => _.attributes);

        verifySkillsInfoWithoutOrder(actualSkillInfos, expectedSkillsInfo);
      });
  }

  function verifySkillsInfoWithoutOrder(actual: ISkillInfo[], expected: ISkillInfo[]): void {
    var actualOrdered = _.orderBy(actual, _ => _.name);
    var expectedOrdered = _.orderBy(expected, _ => _.name);

    expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

    for (var i = 0; i < expected.length; i++) {
      verifySkillInfo(actualOrdered[i], expectedOrdered[i]);
    }
  }

  describe('createSkill', () => {

    it('should create a skill correctly', () => {
      // Act
      var skillInfo: ISkillInfo = createSkillInfo(1);
      var skillPromise: Promise<Skill> =
        SkillsDataHandler.createSkill(skillInfo);

      // Assert
      return verifySkillInfoAsync(skillPromise, skillInfo);
    });

  });

  describe('getSkills', () => {

    it('no skills should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> = SkillsDataHandler.getSkills();

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfo);
    });

    it('should return all created skills', () => {
      // Arrange
      var skillInfo1: ISkillInfo = createSkillInfo(1);
      var skillInfo2: ISkillInfo = createSkillInfo(2);
      var skillInfo3: ISkillInfo = createSkillInfo(3);

      var createAllSkillsPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2),
          SkillsDataHandler.createSkill(skillInfo3)
        ]);

      // Act
      var skillsPromose: Promise<Skill[]> =
        createAllSkillsPromise.then(() => SkillsDataHandler.getSkills());

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [skillInfo1, skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromose, expectedSkillsInfo);
    });

  });

  describe('addSkillPrerequisite', () => {

    it('should create a skillPrerequisite', () => {
      // Act
      var skillInfo1: ISkillInfo = createSkillInfo(1);
      var skillInfo2: ISkillInfo = createSkillInfo(2);

      var createAllSkillsPromise =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2)
        ]);

      var skillPrerequisitePromise: Promise<SkillPrerequisite> =
        createAllSkillsPromise.then((skills: Skill[]) => {
          var skill1 = skills[0];
          var skill2 = skills[1];

          var skillPrerequisiteInfo: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);

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
      return verifySkillPrerequisitesInfoWithoutOrderAsync(prerequisitesPromise, expectedPrerequisitesInfo);
    });

    it('should return all created skill prerequisites', () => {
      // Arrange
      var skillInfo1: ISkillInfo = createSkillInfo(1);
      var skillInfo2: ISkillInfo = createSkillInfo(2);

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

          skillPrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
          skillPrerequisiteInfo2 = createSkillPrerequisiteInfo(skill2, skill1);

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

        return verifySkillPrerequisitesInfoWithoutOrderAsync(skillPrerequisitesPromise, expectedSkillPrerequisitesInfos)
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
      skillInfo1 = createSkillInfo(1);
      skillInfo2 = createSkillInfo(2);
      skillInfo3 = createSkillInfo(3);

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

    it('no skill prerequisites should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillPrerequisites(skillInfo1.name);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('should return all existing skill prerequisites', () => {
      // Arrange
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill3);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillPrerequisites(skillInfo1.name));

      // Assert
      var expectedSkillsInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
    });

    it('should return all existing skill prerequisites and not return other prerequisites', () => {
      // Arrange
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill3);

      var skill2PrerequisiteInfo: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2),
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillPrerequisites(skillInfo1.name));

      // Assert
      var expectedSkillsInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
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
      skillInfo1 = createSkillInfo(1);
      skillInfo2 = createSkillInfo(2);
      skillInfo3 = createSkillInfo(3);

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

    it('no skill prerequisites should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillContributions(skillInfo1.name);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('no skill prerequisites leading to skill should return empty', () => {
      // Act
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill3);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
        ]);

      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(
          () => SkillsDataHandler.getSkillContributions(skillInfo1.name));

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('should return all existing skills with prerequisites of this skill', () => {
      // Arrange
      var skill2PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);
      var skill3PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill3, skill1);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillContributions(skillInfo1.name));

      // Assert
      var expectedSkillInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
    });

    it('should return all existing skill with prerequisites of this skill and not return other skills', () => {
      // Arrange
      var skill2PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);
      var skill3PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill3, skill1);

      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillContributions(skillInfo1.name));

      // Assert
      var expectedSkillInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
    });

  });

});
