import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ISkillInfo} from "./interfaces/iSkillInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { Skill, Skills } from './skill';

chai.use(chaiAsPromised);

describe('Skill', () => {

  describe('new', () => {
    var validSkillInfo: ISkillInfo;
    var validSkillInfo2: ISkillInfo;

    beforeEach(() => {
      validSkillInfo = {
        name: 'skill name 1'
      };

      validSkillInfo2 = {
        name: 'skill name 2'
      };

      return EnvironmentCleaner.clearTables();
    });

    afterEach(() => {
      return EnvironmentCleaner.clearTables();
    });

    it('create skill with empty fields - should return error', () => {
      // Arrange
      var skill = new Skill();

      // Act
      var promise: Promise<Skill> = skill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create skill with missing name - should return error', () => {
      // Arrange
      delete validSkillInfo.name;
      var skill = new Skill(validSkillInfo);

      // Act
      var promise: Promise<Skill> = skill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create skill with existing name should return error', () => {
      // Arrange
      var skill1 = new Skill(validSkillInfo);

      validSkillInfo2.name = validSkillInfo.name;
      var skill2 = new Skill(validSkillInfo2);

      // Act
      var promise: Promise<Skill> =
        skill1.save().then(
          () => skill2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create skill with empty name should return error', () => {
      // Arrange
      validSkillInfo.name = '';
      var skill = new Skill(validSkillInfo);

      // Act
      var promise: Promise<Skill> = skill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create skill with everything ok should save user correctly', () => {
      // Arrange
      var skill = new Skill(validSkillInfo);

      // Act
      var promise: Promise<Skill> = skill.save();

      // Assert
      return expect(promise).to.eventually.equal(skill);
    });

    it('create skill with everything ok should be fetched', () => {
      // Arrange
      var skill = new Skill(validSkillInfo);

      // Act
      var promise: Promise<Skill> = skill.save();

      // Assert
      var skillsPromise =
        promise.then(() => new Skills().fetch());

      return expect(skillsPromise).to.eventually.fulfilled
        .then((skills: Collection<Skill>) => {
          expect(skills.size()).to.be.equal(1);
          expect(skills.at(0).attributes.name).to.be.equal(validSkillInfo.name);
        });
    });

  });
});

describe('Skills', () => {
  describe('clearAll', () => {

    it('should clear all the skills', () => {
      // Act
      var promise: Promise<void> = Skills.clearAll();

      // Assert
      var usersPromise =
        promise.then(() => new Skills().fetch());

      return expect(usersPromise).to.eventually.fulfilled
        .then((users: Collection<Skill>) => {
          expect(users.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        Skills.clearAll().then(() => Skills.clearAll());

      // Assert
      var usersPromise =
        promise.then(() => new Skills().fetch());

      return expect(usersPromise).to.eventually.fulfilled;
    });

  });
});
