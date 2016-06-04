"use strict";
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
        var validSkillPrerequisiteInfo;
        function clearTables() {
            return skillPrerequisite_1.SkillPrerequisites.clearAll()
                .then(function () { return skill_1.Skills.clearAll(); });
        }
        beforeEach(function () {
            validSkillInfo1 = {
                name: 'skill name 1'
            };
            validSkillInfo2 = {
                name: 'skill name 2'
            };
            validSkillPrerequisiteInfo = {
                skill_name: validSkillInfo2.name,
                skill_prerequisite: validSkillInfo1.name
            };
            return clearTables()
                .then(function () { return new skill_1.Skill(validSkillInfo1).save(); })
                .then(function () { return new skill_1.Skill(validSkillInfo2).save(); });
        });
        afterEach(function () {
            return clearTables();
        });
        it('create without any fields should return error', function () {
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite();
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create without name should return error', function () {
            delete validSkillPrerequisiteInfo.skill_name;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create without skill_prerequisite should return error', function () {
            delete validSkillPrerequisiteInfo.skill_prerequisite;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with empty name should return error', function () {
            validSkillPrerequisiteInfo.skill_name = '';
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with empty skill_prerequisite should return error', function () {
            validSkillPrerequisiteInfo.skill_prerequisite = '';
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with non existing skill name should return error', function () {
            validSkillPrerequisiteInfo.skill_name = 'not existing skill name';
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with non existing skill_prerequisite name should return error', function () {
            validSkillPrerequisiteInfo.skill_prerequisite = 'not existing skill name';
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with existing name and skill_prerequisite should succeed', function () {
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.eventually.equal(prerequisite);
        });
        it('create with same name and skill_prerequisite should return error', function () {
            validSkillPrerequisiteInfo.skill_prerequisite = validSkillPrerequisiteInfo.skill_name;
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with existing name and skill_prerequisite should be fetched', function () {
            var prerequisite = new skillPrerequisite_1.SkillPrerequisite(validSkillPrerequisiteInfo);
            var promise = prerequisite.save();
            var prerequisitesPromise = promise.then(function () { return new skillPrerequisite_1.SkillPrerequisites().fetch(); });
            return chai_1.expect(prerequisitesPromise).to.eventually.fulfilled
                .then(function (prerequisite) {
                chai_1.expect(prerequisite.size()).to.be.equal(1);
                chai_1.expect(prerequisite.at(0).attributes.skill_name).to.be.equal(validSkillPrerequisiteInfo.skill_name);
                chai_1.expect(prerequisite.at(0).attributes.skill_prerequisite).to.be.equal(validSkillPrerequisiteInfo.skill_prerequisite);
            });
        });
        it('create 2 different prerequisites with existing name should succeed', function () {
            var skillPrerequisiteInfo1 = {
                skill_name: validSkillInfo1.name,
                skill_prerequisite: validSkillInfo2.name
            };
            var skillPrerequisiteInfo2 = {
                skill_name: validSkillInfo2.name,
                skill_prerequisite: validSkillInfo1.name
            };
            var prerequisite1 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo1);
            var prerequisite2 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo2);
            var promise = prerequisite1.save()
                .then(function () { return prerequisite2.save(); });
            return chai_1.expect(promise).to.eventually.equal(prerequisite2);
        });
        it('create 2 different prerequisites should be fetched', function () {
            var skillPrerequisiteInfo1 = {
                skill_name: validSkillInfo1.name,
                skill_prerequisite: validSkillInfo2.name
            };
            var skillPrerequisiteInfo2 = {
                skill_name: validSkillInfo2.name,
                skill_prerequisite: validSkillInfo1.name
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
                skill_name: validSkillInfo1.name,
                skill_prerequisite: validSkillInfo2.name
            };
            var skillPrerequisiteInfo2 = {
                skill_name: skillPrerequisiteInfo1.skill_name,
                skill_prerequisite: skillPrerequisiteInfo1.skill_name
            };
            var prerequisite1 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo1);
            var prerequisite2 = new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo2);
            var promise = prerequisite1.save()
                .then(function () { return prerequisite2.save(); });
            return chai_1.expect(promise).to.be.rejected;
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
