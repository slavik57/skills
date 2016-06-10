"use strict";
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var skill_1 = require('./skill');
var skillPrerequisite_1 = require('./skillPrerequisite');
chai.use(chaiAsPromised);
describe('SkillPrerequisite', function () {
    describe('new', function () {
        var validSkillInfo1;
        var validSkillInfo2;
        var skill1;
        var skill2;
        var validSkillPrerequisiteInfo;
        beforeEach(function () {
            validSkillInfo1 = {
                name: 'skill name 1'
            };
            validSkillInfo2 = {
                name: 'skill name 2'
            };
            return environmentCleaner_1.EnvironmentCleaner.clearTables()
                .then(function () { return Promise.all([
                new skill_1.Skill(validSkillInfo1).save(),
                new skill_1.Skill(validSkillInfo2).save()
            ]); })
                .then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                validSkillPrerequisiteInfo = {
                    skill_id: skill2.id,
                    skill_prerequisite_id: skill1.id
                };
            });
        });
        afterEach(function () {
            return environmentCleaner_1.EnvironmentCleaner.clearTables();
        });
        it('create without any fields should return error', function () {
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite();
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without skill_id should return error', function () {
            delete validSkillPrerequisiteInfo.skill_id;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without skill_prerequisite_id should return error', function () {
            delete validSkillPrerequisiteInfo.skill_prerequisite_id;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer skill_id should return error', function () {
            validSkillPrerequisiteInfo.skill_id = 1.1;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer skill_prerequisite_id should return error', function () {
            validSkillPrerequisiteInfo.skill_prerequisite_id = 1.1;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing skill_id should return error', function () {
            validSkillPrerequisiteInfo.skill_id = skill1.id + skill2.id + 1;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing skill_prerequisite_id name should return error', function () {
            validSkillPrerequisiteInfo.skill_prerequisite_id = skill1.id + skill2.id + 1;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing skill_id and skill_prerequisite_id should succeed', function () {
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.equal(prerequisite);
        });
        it('create with same skill_id and skill_prerequisite_id should return error', function () {
            validSkillPrerequisiteInfo.skill_prerequisite_id = validSkillPrerequisiteInfo.skill_id;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing skill_id and skill_prerequisite_id should be fetched', function () {
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            var prerequisitesPromise = promise.then(function () { return new skillPrerequisite_1.SkillPrerequisites().fetch(); });
            return chai_1.expect(prerequisitesPromise).to.eventually.fulfilled
                .then(function (prerequisite) {
                chai_1.expect(prerequisite.size()).to.be.equal(1);
                chai_1.expect(prerequisite.at(0).attributes.skill_id).to.be.equal(validSkillPrerequisiteInfo.skill_id);
                chai_1.expect(prerequisite.at(0).attributes.skill_prerequisite_id).to.be.equal(validSkillPrerequisiteInfo.skill_prerequisite_id);
            });
        });
        it('create 2 different prerequisites should succeed', function () {
            var skillPrerequisiteInfo1 = {
                skill_id: skill1.id,
                skill_prerequisite_id: skill2.id
            };
            var skillPrerequisiteInfo2 = {
                skill_id: skill2.id,
                skill_prerequisite_id: skill1.id
            };
            var prerequisite1 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo1);
            var prerequisite2 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo2);
            var promise = prerequisite1.save()
                .then(function () { return prerequisite2.save(); });
            return chai_1.expect(promise).to.eventually.equal(prerequisite2);
        });
        it('create 2 different prerequisites should be fetched', function () {
            var skillPrerequisiteInfo1 = {
                skill_id: skill1.id,
                skill_prerequisite_id: skill2.id
            };
            var skillPrerequisiteInfo2 = {
                skill_id: skill2.id,
                skill_prerequisite_id: skill1.id
            };
            var prerequisite1 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo1);
            var prerequisite2 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo2);
            var promise = prerequisite1.save()
                .then(function () { return prerequisite2.save(); });
            var prerequisitesPromise = promise.then(function () { return new skillPrerequisite_1.SkillPrerequisites().fetch(); });
            return chai_1.expect(prerequisitesPromise).to.eventually.fulfilled
                .then(function (prerequisites) {
                chai_1.expect(prerequisites.size()).to.be.equal(2);
            });
        });
        it('create 2 same prerequisites should return error', function () {
            var skillPrerequisiteInfo1 = {
                skill_id: skill1.id,
                skill_prerequisite_id: skill2.id
            };
            var skillPrerequisiteInfo2 = {
                skill_id: skillPrerequisiteInfo1.skill_id,
                skill_prerequisite_id: skillPrerequisiteInfo1.skill_prerequisite_id
            };
            var prerequisite1 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo1);
            var prerequisite2 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo2);
            var promise = prerequisite1.save()
                .then(function () { return prerequisite2.save(); });
            return chai_1.expect(promise).to.eventually.rejected;
        });
    });
});
describe('SkillPrerequisites', function () {
    describe('clearAll', function () {
        it('should clear all the users', function () {
            var promise = skillPrerequisite_1.SkillPrerequisites.clearAll();
            var prerequisitesPromose = promise.then(function () { return new skillPrerequisite_1.SkillPrerequisites().fetch(); });
            return chai_1.expect(prerequisitesPromose).to.eventually.fulfilled
                .then(function (prerequisites) {
                chai_1.expect(prerequisites.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = skillPrerequisite_1.SkillPrerequisites.clearAll().then(function () { return skillPrerequisite_1.SkillPrerequisites.clearAll(); });
            var prerequisitesPromose = promise.then(function () { return new skillPrerequisite_1.SkillPrerequisites().fetch(); });
            return chai_1.expect(prerequisitesPromose).to.eventually.fulfilled;
        });
    });
});
