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


      validSkillPrerequisiteInfo = {
        skill_name: validSkillInfo2.name,
        skill_prerequisite: validSkillInfo1.name
      }

      return clearTables()
        .then(() => new Skill(validSkillInfo1).save())
        .then(() => new Skill(validSkillInfo2).save());
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

    it('create without name should return error', () => {
      /// Arrange
      delete validSkillPrerequisiteInfo.skill_name;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create without skill_prerequisite should return error', () => {
      /// Arrange
      delete validSkillPrerequisiteInfo.skill_prerequisite;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with empty name should return error', () => {
      /// Arrange
      validSkillPrerequisiteInfo.skill_name = '';
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with empty skill_prerequisite should return error', () => {
      /// Arrange
      validSkillPrerequisiteInfo.skill_prerequisite = '';
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non existing skill name should return error', () => {
      /// Arrange
      validSkillPrerequisiteInfo.skill_name = 'not existing skill name';
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with non existing skill_prerequisite name should return error', () => {
      // Arrange
      validSkillPrerequisiteInfo.skill_prerequisite = 'not existing skill name';
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with existing name and skill_prerequisite should succeed', () => {
      /// Arrange
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.eventually.equal(prerequisite);
    });

    it('create with same name and skill_prerequisite should return error', () => {
      // Arrange
      validSkillPrerequisiteInfo.skill_prerequisite = validSkillPrerequisiteInfo.skill_name;
      var prerequisite = new SkillPrerequisite(validSkillPrerequisiteInfo);

      // Act
      var promise: Promise<SkillPrerequisite> = prerequisite.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create with existing name and skill_prerequisite should be fetched', () => {
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
          expect(prerequisite.at(0).attributes.skill_name).to.be.equal(validSkillPrerequisiteInfo.skill_name);
          expect(prerequisite.at(0).attributes.skill_prerequisite).to.be.equal(validSkillPrerequisiteInfo.skill_prerequisite);
        });
    });

    it('create 2 different prerequisites with existing name should succeed', () => {
      // Arrange
      var skillPrerequisiteInfo1: ISkillPrerequisiteInfo = {
        skill_name: validSkillInfo1.name,
        skill_prerequisite: validSkillInfo2.name
      };

      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo = {
        skill_name: validSkillInfo2.name,
        skill_prerequisite: validSkillInfo1.name
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
        skill_name: validSkillInfo1.name,
        skill_prerequisite: validSkillInfo2.name
      };

      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo = {
        skill_name: validSkillInfo2.name,
        skill_prerequisite: validSkillInfo1.name
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
        skill_name: validSkillInfo1.name,
        skill_prerequisite: validSkillInfo2.name
      };

      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo = {
        skill_name: skillPrerequisiteInfo1.skill_name,
        skill_prerequisite: skillPrerequisiteInfo1.skill_name
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
