"use strict";
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var skill_1 = require('./skill');
var skillCreator_1 = require('./skillCreator');
chai.use(chaiAsPromised);
describe('SkillCreator', function () {
    describe('new', function () {
        var skill;
        var user;
        var otherSkill;
        var skillCreatorInfo;
        beforeEach(function () {
            var skillInfo1 = {
                name: 'skill name 1'
            };
            var skillInfo2 = {
                name: 'skill name 2'
            };
            return environmentCleaner_1.EnvironmentCleaner.clearTables()
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1); })
                .then(function (_users) {
                user = _users[0];
            })
                .then(function () { return Promise.all([
                new skill_1.Skill(skillInfo1).save(),
                new skill_1.Skill(skillInfo2).save()
            ]); })
                .then(function (_skills) {
                skill = _skills[0], otherSkill = _skills[1];
                skillCreatorInfo = {
                    user_id: user.id,
                    skill_id: skill.id
                };
            });
        });
        afterEach(function () {
            return environmentCleaner_1.EnvironmentCleaner.clearTables();
        });
        it('create without any fields should return error', function () {
            var creator = new skillCreator_1.SkillCreator();
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without skill_id should return error', function () {
            delete skillCreatorInfo.skill_id;
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without user_id should return error', function () {
            delete skillCreatorInfo.user_id;
            var prerequisite = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var creator = prerequisite.save();
            return chai_1.expect(creator).to.eventually.rejected;
        });
        it('create with non integer skill_id should return error', function () {
            skillCreatorInfo.skill_id = 1.1;
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer user_id should return error', function () {
            skillCreatorInfo.user_id = 1.1;
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing skill_id should return error', function () {
            skillCreatorInfo.skill_id = skill.id + otherSkill.id + 1;
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing user_id should return error', function () {
            skillCreatorInfo.user_id = user.id + 1;
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing skill_id and user_id should succeed', function () {
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.equal(creator);
        });
        it('create with existing skill_id and user_id should be fetched', function () {
            var creator = new skillCreator_1.SkillCreator(skillCreatorInfo);
            var promise = creator.save();
            var creatorsPromise = promise.then(function () { return new skillCreator_1.SkillCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled
                .then(function (_creatorsCollection) {
                chai_1.expect(_creatorsCollection.size()).to.be.equal(1);
                chai_1.expect(_creatorsCollection.at(0).attributes.skill_id).to.be.equal(skillCreatorInfo.skill_id);
                chai_1.expect(_creatorsCollection.at(0).attributes.user_id).to.be.equal(skillCreatorInfo.user_id);
            });
        });
        it('create 2 different skills with same creator should succeed', function () {
            var creatorInfo1 = {
                skill_id: skill.id,
                user_id: user.id
            };
            var creatorInfo2 = {
                skill_id: otherSkill.id,
                user_id: user.id
            };
            var creator1 = new skillCreator_1.SkillCreator(creatorInfo1);
            var creator2 = new skillCreator_1.SkillCreator(creatorInfo2);
            var promise = creator1.save()
                .then(function () { return creator2.save(); });
            return chai_1.expect(promise).to.eventually.equal(creator2);
        });
        it('create 2 different skills with same creator should be fetched', function () {
            var creatorInfo1 = {
                skill_id: skill.id,
                user_id: user.id
            };
            var creatorInfo2 = {
                skill_id: otherSkill.id,
                user_id: user.id
            };
            var creator1 = new skillCreator_1.SkillCreator(creatorInfo1);
            var creator2 = new skillCreator_1.SkillCreator(creatorInfo2);
            var promise = creator1.save()
                .then(function () { return creator2.save(); });
            var creatorsPromise = promise.then(function () { return new skillCreator_1.SkillCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled
                .then(function (_creators) {
                chai_1.expect(_creators.size()).to.be.equal(2);
            });
        });
        it('create 2 creators with same skill should return error', function () {
            var creatorInfo1 = {
                skill_id: skill.id,
                user_id: user.id
            };
            var creatorInfo2 = {
                skill_id: creatorInfo1.skill_id,
                user_id: creatorInfo1.user_id
            };
            var creator1 = new skillCreator_1.SkillCreator(creatorInfo1);
            var creator2 = new skillCreator_1.SkillCreator(creatorInfo2);
            var promise = creator1.save()
                .then(function () { return creator2.save(); });
            return chai_1.expect(promise).to.eventually.rejected;
        });
    });
});
describe('SkillCreators', function () {
    describe('clearAll', function () {
        it('should clear all the users', function () {
            var promise = skillCreator_1.SkillCreators.clearAll();
            var creatorsPromise = promise.then(function () { return new skillCreator_1.SkillCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled
                .then(function (_creators) {
                chai_1.expect(_creators.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = skillCreator_1.SkillCreators.clearAll().then(function () { return skillCreator_1.SkillCreators.clearAll(); });
            var creatorsPromise = promise.then(function () { return new skillCreator_1.SkillCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled;
        });
    });
});
//# sourceMappingURL=skillCreator.test.js.map