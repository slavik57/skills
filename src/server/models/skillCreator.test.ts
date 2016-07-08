import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {User} from "./user";
import {IUserInfo} from "./interfaces/iUserInfo";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ISkillCreatorInfo} from "./interfaces/iSkillCreatorInfo";
import {ISkillInfo} from "./interfaces/iSkillInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { Skill, Skills } from './skill';
import { SkillCreator, SkillCreators } from './skillCreator';

chai.use(chaiAsPromised);

describe('SkillCreator', () => {
  describe('new', () => {
    var skill: Skill;
    var user: User;
    var otherSkill: Skill;

    var skillCreatorInfo: ISkillCreatorInfo;

    beforeEach(() => {
      var skillInfo1: ISkillInfo = {
        name: 'skill name 1'
      };
      var skillInfo2: ISkillInfo = {
        name: 'skill name 2'
      };

      return EnvironmentCleaner.clearTables()
        .then(() => EnvironmentDirtifier.createUsers(1))
        .then((_users: User[]) => {
          [user] = _users;
        })
        .then(() => Promise.all([
          new Skill(skillInfo1).save(),
          new Skill(skillInfo2).save()
        ]))
        .then((_skills: Skill[]) => {
          [skill, otherSkill] = _skills;

          skillCreatorInfo = {
            user_id: user.id,
            skill_id: skill.id
          }
        });
    });

    afterEach(() => {
      return EnvironmentCleaner.clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var creator = new SkillCreator();

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without skill_id should return error', () => {
      /// Arrange
      delete skillCreatorInfo.skill_id;
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without user_id should return error', () => {
      /// Arrange
      delete skillCreatorInfo.user_id;
      var prerequisite = new SkillCreator(skillCreatorInfo);

      // Act
      var creator: Promise<SkillCreator> = prerequisite.save();

      // Assert
      return expect(creator).to.eventually.rejected;
    });

    it('create with non integer skill_id should return error', () => {
      /// Arrange
      skillCreatorInfo.skill_id = 1.1;
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer user_id should return error', () => {
      /// Arrange
      skillCreatorInfo.user_id = 1.1;
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing skill_id should return error', () => {
      /// Arrange
      skillCreatorInfo.skill_id = skill.id + otherSkill.id + 1;
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing user_id should return error', () => {
      // Arrange
      skillCreatorInfo.user_id = user.id + 1;
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with existing skill_id and user_id should succeed', () => {
      /// Arrange
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.equal(creator);
    });

    it('create with existing skill_id and user_id should be fetched', () => {
      /// Arrange
      var creator = new SkillCreator(skillCreatorInfo);

      // Act
      var promise: Promise<SkillCreator> = creator.save();

      // Assert
      var creatorsPromise =
        promise.then(() => new SkillCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled
        .then((_creatorsCollection: Collection<SkillCreator>) => {
          expect(_creatorsCollection.size()).to.be.equal(1);
          expect(_creatorsCollection.at(0).attributes.skill_id).to.be.equal(skillCreatorInfo.skill_id);
          expect(_creatorsCollection.at(0).attributes.user_id).to.be.equal(skillCreatorInfo.user_id);
        });
    });

    it('create 2 different skills with same creator should succeed', () => {
      // Arrange
      var creatorInfo1: ISkillCreatorInfo = {
        skill_id: skill.id,
        user_id: user.id
      };

      var creatorInfo2: ISkillCreatorInfo = {
        skill_id: otherSkill.id,
        user_id: user.id
      };

      var creator1 = new SkillCreator(creatorInfo1);
      var creator2 = new SkillCreator(creatorInfo2);

      // Act
      var promise: Promise<SkillCreator> =
        creator1.save()
          .then(() => creator2.save());

      // Assert
      return expect(promise).to.eventually.equal(creator2);
    });

    it('create 2 different skills with same creator should be fetched', () => {
      // Arrange
      var creatorInfo1: ISkillCreatorInfo = {
        skill_id: skill.id,
        user_id: user.id
      };

      var creatorInfo2: ISkillCreatorInfo = {
        skill_id: otherSkill.id,
        user_id: user.id
      };

      var creator1 = new SkillCreator(creatorInfo1);
      var creator2 = new SkillCreator(creatorInfo2);

      // Act
      var promise: Promise<SkillCreator> =
        creator1.save()
          .then(() => creator2.save());

      // Assert
      var creatorsPromise =
        promise.then(() => new SkillCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled
        .then((_creators: Collection<SkillCreator>) => {
          expect(_creators.size()).to.be.equal(2);
        });
    });

    it('create 2 creators with same skill should return error', () => {
      var creatorInfo1: ISkillCreatorInfo = {
        skill_id: skill.id,
        user_id: user.id
      };

      var creatorInfo2: ISkillCreatorInfo = {
        skill_id: creatorInfo1.skill_id,
        user_id: creatorInfo1.user_id
      };

      var creator1 = new SkillCreator(creatorInfo1);
      var creator2 = new SkillCreator(creatorInfo2);

      // Act
      var promise: Promise<SkillCreator> =
        creator1.save()
          .then(() => creator2.save());

      // Assert
      return expect(promise).to.eventually.rejected;
    });
  });
});

describe('SkillCreators', () => {
  describe('clearAll', () => {

    it('should clear all the creators', () => {
      // Act
      var promise: Promise<void> = SkillCreators.clearAll();

      // Assert
      var creatorsPromise =
        promise.then(() => new SkillCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled
        .then((_creators: Collection<SkillCreator>) => {
          expect(_creators.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        SkillCreators.clearAll().then(() => SkillCreators.clearAll());

      // Assert
      var creatorsPromise =
        promise.then(() => new SkillCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled;
    });

  });
});
