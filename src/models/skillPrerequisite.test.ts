import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { ISkillInfo, Skill, Skills } from './skill';
import { ISkillPrerequisiteInfo, SkillPrerequisite, SkillPrerequisites } from './skillPrerequisite';

chai.use(chaiAsPromised);

describe('SkillPrerequisite', () => {
  describe('new', () => {
    var validSkillInfo1: ISkillInfo;
    var validSkillInfo2: ISkillInfo;
    var skill1: Skill;
    var skill2: Skill;

    var validSkillPrerequisiteInfo: ISkillPrerequisiteInfo;

    function clearTables(): Promise<any> {
      return SkillPrerequisites.clearAll()
        .then(() => Skills.clearAll());
    }

    beforeEach(() => {
      validSkillInfo1 = {
        name: 'skill name 1'
      };

      validSkillInfo2 = {
        name: 'skill name 2'
      };

      return clearTables()
        .then(() => Promise.all([
          new Skill(validSkillInfo1).save(),
          new Skill(validSkillInfo2).save()
        ]))
        .then((skills: Skill[]) => {
          skill1 = skills[0];
          skill2 = skills[1];

          validSkillPrerequisiteInfo = {
            skill_id: skill2.id,
            skill_prerequisite_id: skill1.id
          }
        });
    });

    afterEach(() => {
      return clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var prerequisite = new SkillPrerequisite();

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create without skill_id should return error', () => {
      /// Arrange
      delete validSkillPrerequisiteInfo.skill_id;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create without skill_prerequisite_id should return error', () => {
      /// Arrange
      delete validSkillPrerequisiteInfo.skill_prerequisite_id;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non integer skill_id should return error', () => {
      /// Arrange
      validSkillPrerequisiteInfo.skill_id = 1.1;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non integer skill_prerequisite_id should return error', () => {
      /// Arrange
      validSkillPrerequisiteInfo.skill_prerequisite_id = 1.1;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non existing skill_id should return error', () => {
      /// Arrange
      validSkillPrerequisiteInfo.skill_id = skill1.id + skill2.id + 1;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non existing skill_prerequisite_id name should return error', () => {
      // Arrange
      validSkillPrerequisiteInfo.skill_prerequisite_id = skill1.id + skill2.id + 1;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with existing skill_id and skill_prerequisite_id should succeed', () => {
      /// Arrange
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.eventually.equal(prerequisite);
    });

    it('create with same skill_id and skill_prerequisite_id should return error', () => {
      // Arrange
      validSkillPrerequisiteInfo.skill_prerequisite_id = validSkillPrerequisiteInfo.skill_id;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with existing skill_id and skill_prerequisite_id should be fetched', () => {
      /// Arrange
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      var prerequisitesPromise =
        promise.then(() => new SkillPrerequisites().fetch());

      return expect(prerequisitesPromise).to.eventually.fulfilled
        .then((prerequisite: Collection<SkillPrerequisite>) => {
          expect(prerequisite.size()).to.be.equal(1);
          expect(prerequisite.at(0).attributes.skill_id).to.be.equal(validSkillPrerequisiteInfo.skill_id);
          expect(prerequisite.at(0).attributes.skill_prerequisite_id).to.be.equal(validSkillPrerequisiteInfo.skill_prerequisite_id);
        });
    });

    it('create 2 different prerequisites should succeed', () => {
      // Arrange
      var skillPrerequisiteInfo1: ISkillPrerequisiteInfo = {
        skill_id: skill1.id,
        skill_prerequisite_id: skill2.id
      };

      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo = {
        skill_id: skill2.id,
        skill_prerequisite_id: skill1.id
      };

      var prerequisite1 = new SkillPrerequisite(skillPrerequisiteInfo1);
      var prerequisite2 = new SkillPrerequisite(skillPrerequisiteInfo2);

      // Act
      var promise: Promise<SkillPrerequisite> =
        prerequisite1.save()
          .then(() => prerequisite2.save());

      // Assert
      return expect(promise).to.eventually.equal(prerequisite2);
    });

    it('create 2 different prerequisites should be fetched', () => {
      // Arrange
      var skillPrerequisiteInfo1: ISkillPrerequisiteInfo = {
        skill_id: skill1.id,
        skill_prerequisite_id: skill2.id
      };

      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo = {
        skill_id: skill2.id,
        skill_prerequisite_id: skill1.id
      };

      var prerequisite1 = new SkillPrerequisite(skillPrerequisiteInfo1);
      var prerequisite2 = new SkillPrerequisite(skillPrerequisiteInfo2);

      // Act
      var promise: Promise<SkillPrerequisite> =
        prerequisite1.save()
          .then(() => prerequisite2.save());

      // Assert
      var prerequisitesPromise =
        promise.then(() => new SkillPrerequisites().fetch());

      return expect(prerequisitesPromise).to.eventually.fulfilled
        .then((prerequisites: Collection<SkillPrerequisite>) => {
          expect(prerequisites.size()).to.be.equal(2);
        });
    });

    it('create 2 same prerequisites should return error', () => {
      var skillPrerequisiteInfo1: ISkillPrerequisiteInfo = {
        skill_id: skill1.id,
        skill_prerequisite_id: skill2.id
      };

      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo = {
        skill_id: skillPrerequisiteInfo1.skill_id,
        skill_prerequisite_id: skillPrerequisiteInfo1.skill_prerequisite_id
      };

      var prerequisite1 = new SkillPrerequisite(skillPrerequisiteInfo1);
      var prerequisite2 = new SkillPrerequisite(skillPrerequisiteInfo2);

      // Act
      var promise: Promise<SkillPrerequisite> =
        prerequisite1.save()
          .then(() => prerequisite2.save());

      // Assert
      return expect(promise).to.be.rejected;
    });
  });
});

describe('SkillPrerequisites', () => {
  describe('clearAll', () => {

    it('should clear all the users', () => {
      // Act
      var promise: Promise<void> = SkillPrerequisites.clearAll();

      // Assert
      var prerequisitesPromose =
        promise.then(() => new SkillPrerequisites().fetch());

      return expect(prerequisitesPromose).to.eventually.fulfilled
        .then((prerequisites: Collection<SkillPrerequisite>) => {
          expect(prerequisites.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        SkillPrerequisites.clearAll().then(() => SkillPrerequisites.clearAll());

      // Assert
      var prerequisitesPromose =
        promise.then(() => new SkillPrerequisites().fetch());

      return expect(prerequisitesPromose).to.eventually.fulfilled;
    });

  });
});
