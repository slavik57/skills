"use strict";
var chai_1 = require('chai');
var _ = require('lodash');
var skill_1 = require('../models/skill');
var skillPrerequisite_1 = require('../models/skillPrerequisite');
var skillsDataHandler_1 = require('./skillsDataHandler');
describe('SkillsDataHandler', function () {
    function clearTables() {
        return skillPrerequisite_1.SkillPrerequisites.clearAll()
            .then(function () { return skill_1.Skills.clearAll(); });
    }
    beforeEach(function () {
        return clearTables();
    });
    afterEach(function () {
        return clearTables();
    });
    function createSkillInfo(skillNumber) {
        var skillNumberString = skillNumber.toString();
        return {
            name: 'name ' + skillNumberString
        };
    }
    function verifySkillInfoAsync(actualSkillPromise, expectedSkillInfo) {
        return chai_1.expect(actualSkillPromise).to.eventually.fulfilled
            .then(function (skill) {
            verifySkillInfo(skill.attributes, expectedSkillInfo);
        });
    }
    function verifySkillInfo(actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned['id'];
        delete expectedCloned['id'];
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    }
    function createSkillPrerequisiteInfo(skill, skillPrerequisite) {
        return {
            skill_id: skill.id,
            skill_prerequisite_id: skillPrerequisite.id
        };
    }
    function verifySkillPrerequisiteInfoAsync(actualSkillPrerequisitePromise, expectedSkillPrerequisiteInfo) {
        return chai_1.expect(actualSkillPrerequisitePromise).to.eventually.fulfilled
            .then(function (skillPrerequisite) {
            verifySkillPrerequisiteInfo(skillPrerequisite.attributes, expectedSkillPrerequisiteInfo);
        });
    }
    function verifySkillPrerequisiteInfo(actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned['id'];
        delete expectedCloned['id'];
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    }
    function verifySkillPrerequisitesInfoWithoutOrderAsync(actualSkillPrerequisitesPromise, expectedSkillPrerequisitesInfo) {
        return chai_1.expect(actualSkillPrerequisitesPromise).to.eventually.fulfilled
            .then(function (skillPrerequisites) {
            var actualSkillPrerequisitesInfos = _.map(skillPrerequisites, function (_) { return _.attributes; });
            verifyPrerequisitesInfoWithoutOrder(actualSkillPrerequisitesInfos, expectedSkillPrerequisitesInfo);
        });
    }
    function verifyPrerequisitesInfoWithoutOrder(actual, expected) {
        var actualOrdered = _.orderBy(actual, function (_) { return _.skill_id; });
        var expectedOrdered = _.orderBy(expected, function (_) { return _.skill_id; });
        chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
        for (var i = 0; i < expected.length; i++) {
            verifySkillPrerequisiteInfo(actualOrdered[i], expectedOrdered[i]);
        }
    }
    function verifySkillsInfoWithoutOrderAsync(actualSkillsPromise, expectedSkillsInfo) {
        return chai_1.expect(actualSkillsPromise).to.eventually.fulfilled
            .then(function (skills) {
            var actualSkillInfos = _.map(skills, function (_) { return _.attributes; });
            verifySkillsInfoWithoutOrder(actualSkillInfos, expectedSkillsInfo);
        });
    }
    function verifySkillsInfoWithoutOrder(actual, expected) {
        var actualOrdered = _.orderBy(actual, function (_) { return _.name; });
        var expectedOrdered = _.orderBy(expected, function (_) { return _.name; });
        chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
        for (var i = 0; i < expected.length; i++) {
            verifySkillInfo(actualOrdered[i], expectedOrdered[i]);
        }
    }
    describe('createSkill', function () {
        it('should create a skill correctly', function () {
            var skillInfo = createSkillInfo(1);
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo);
            return verifySkillInfoAsync(skillPromise, skillInfo);
        });
    });
    describe('getSkills', function () {
        it('no skills should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkills();
            var expectedSkillsInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfo);
        });
        it('should return all created skills', function () {
            var skillInfo1 = createSkillInfo(1);
            var skillInfo2 = createSkillInfo(2);
            var skillInfo3 = createSkillInfo(3);
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]);
            var skillsPromose = createAllSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); });
            var expectedSkillsInfo = [skillInfo1, skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromose, expectedSkillsInfo);
        });
    });
    describe('addSkillPrerequisite', function () {
        it('should create a skillPrerequisite', function () {
            var skillInfo1 = createSkillInfo(1);
            var skillInfo2 = createSkillInfo(2);
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2)
            ]);
            var skillPrerequisitePromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                var skillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
                return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
            });
            return chai_1.expect(skillPrerequisitePromise).to.eventually.fulfilled;
        });
    });
    describe('getSkillsPrerequisites', function () {
        it('no skill prerequisites should return empty', function () {
            var prerequisitesPromise = skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites();
            var expectedPrerequisitesInfo = [];
            return verifySkillPrerequisitesInfoWithoutOrderAsync(prerequisitesPromise, expectedPrerequisitesInfo);
        });
        it('should return all created skill prerequisites', function () {
            var skillInfo1 = createSkillInfo(1);
            var skillInfo2 = createSkillInfo(2);
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2)
            ]);
            var skillPrerequisiteInfo1;
            var skillPrerequisiteInfo2;
            var createAllSkillPrerequisitesPromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                skillPrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
                skillPrerequisiteInfo2 = createSkillPrerequisiteInfo(skill2, skill1);
                return Promise.all([
                    skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo1),
                    skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo2),
                ]);
            });
            var skillPrerequisitesPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites(); });
            return skillPrerequisitesPromise.then(function () {
                var expectedSkillPrerequisitesInfos = [skillPrerequisiteInfo1, skillPrerequisiteInfo2];
                return verifySkillPrerequisitesInfoWithoutOrderAsync(skillPrerequisitesPromise, expectedSkillPrerequisitesInfos);
            });
        });
    });
    describe('getSkillPrerequisites', function () {
        var skillInfo1;
        var skillInfo2;
        var skillInfo3;
        var skill1;
        var skill2;
        var skill3;
        beforeEach(function () {
            skillInfo1 = createSkillInfo(1);
            skillInfo2 = createSkillInfo(2);
            skillInfo3 = createSkillInfo(3);
            return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]).then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                skill3 = skills[2];
            });
        });
        it('no skill prerequisites should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillInfo1.name);
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('should return all existing skill prerequisites', function () {
            var skill1PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill3);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillInfo1.name); });
            var expectedSkillsInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
        });
        it('should return all existing skill prerequisites and not return other prerequisites', function () {
            var skill1PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill3);
            var skill2PrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillInfo1.name); });
            var expectedSkillsInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
        });
    });
    describe('getSkillContributions', function () {
        var skillInfo1;
        var skillInfo2;
        var skillInfo3;
        var skill1;
        var skill2;
        var skill3;
        beforeEach(function () {
            skillInfo1 = createSkillInfo(1);
            skillInfo2 = createSkillInfo(2);
            skillInfo3 = createSkillInfo(3);
            return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]).then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                skill3 = skills[2];
            });
        });
        it('no skill prerequisites should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name);
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('no skill prerequisites leading to skill should return empty', function () {
            var skill1PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill3);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name); });
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('should return all existing skills with prerequisites of this skill', function () {
            var skill2PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill2, skill1);
            var skill3PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill3, skill1);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
        });
        it('should return all existing skill with prerequisites of this skill and not return other skills', function () {
            var skill2PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill2, skill1);
            var skill3PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill3, skill1);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill2);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
        });
    });
});
