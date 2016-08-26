"use strict";
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoComparers_1 = require("../testUtils/modelInfoComparers");
var modelVerificator_1 = require("../testUtils/modelVerificator");
var modelInfoVerificator_1 = require("../testUtils/modelInfoVerificator");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var teamSkill_1 = require("../models/teamSkill");
var teamsDataHandler_1 = require("./teamsDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var skillsDataHandler_1 = require('./skillsDataHandler');
var userDataHandler_1 = require('./userDataHandler');
var bluebirdPromise = require('bluebird');
chai.use(chaiAsPromised);
describe('SkillsDataHandler', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('createSkill', function () {
        var user;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
            });
        });
        it('should create a skill correctly', function () {
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, user.id);
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(skillPromise, skillInfo);
        });
        it('should add the creator to skill creators', function () {
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, user.id);
            var skill;
            return chai_1.expect(skillPromise).to.eventually.fulfilled
                .then(function (_skill) {
                skill = _skill;
            })
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsCreators(); })
                .then(function (_skillsCreators) {
                chai_1.expect(_skillsCreators).to.be.length(1);
                var expectedInfo = {
                    user_id: user.id,
                    skill_id: skill.id
                };
                modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skillsCreators[0].attributes, expectedInfo);
            });
        });
    });
    describe('deleteSkill', function () {
        var testModels;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.fillAllTables()
                .then(function (_testModels) {
                testModels = _testModels;
            });
        });
        it('not existing skill should not fail', function () {
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(9999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing skill should not fail', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing skill should remove the skill', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkill(skillToDelete.id); })
                .then(function (skill) {
                chai_1.expect(skill).to.be.null;
            });
        });
        it('existing skill should remove the relevant skill prerequisites', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites(); })
                .then(function (_prerequisites) {
                return _.map(_prerequisites, function (_) { return _.attributes.skill_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(skillToDelete.id);
            });
        });
        it('existing skill should remove the relevant skill contributors', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites(); })
                .then(function (_prerequisites) {
                return _.map(_prerequisites, function (_) { return _.attributes.skill_prerequisite_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(skillToDelete.id);
            });
        });
        it('existing skill should remove the relevant team skills', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkill_1.TeamSkills().fetch(); })
                .then(function (_teamSkillsCollection) { return _teamSkillsCollection.toArray(); })
                .then(function (_teamSkills) {
                return _.map(_teamSkills, function (_) { return _.attributes.skill_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(skillToDelete.id);
            });
        });
        it('existing skill should remove the relevant team skill upvotes', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); })
                .then(function (_teamSkillUpvotesCollection) { return _teamSkillUpvotesCollection.toArray(); })
                .then(function (_teamSkillsUpvotes) {
                return _.map(_teamSkillsUpvotes, function (_) { return _.attributes.team_skill_id; });
            })
                .then(function (_teamSkillIds) {
                return _.filter(testModels.teamSkills, function (_) { return _teamSkillIds.indexOf(_.id) >= 0; });
            })
                .then(function (_teamSkills) {
                return _.map(_teamSkills, function (_) { return _.attributes.skill_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(skillToDelete.id);
            });
        });
        it('existing skill should remove the relevant skill creators', function () {
            var skillToDelete = testModels.skills[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.deleteSkill(skillToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsCreators(); })
                .then(function (_creators) {
                return _.map(_creators, function (_) { return _.attributes.skill_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(skillToDelete.id);
            });
        });
    });
    describe('getSkill', function () {
        it('no such skill should return null', function () {
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.getSkill(1234);
            return chai_1.expect(skillPromise).to.eventually.null;
        });
        it('skill exists should return correct skill', function () {
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var createSkillPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, _users[0].id); });
            var getSkillPromise = createSkillPromise.then(function (skill) { return skillsDataHandler_1.SkillsDataHandler.getSkill(skill.id); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getSkillPromise, skillInfo);
        });
    });
    describe('getSkillByName', function () {
        it('no such skill should return null', function () {
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.getSkillByName('not existing skill name');
            return chai_1.expect(skillPromise).to.eventually.null;
        });
        it('skill exists should return correct skill', function () {
            var skillName = 'a';
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(skillName);
            var createSkillPromose = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, _users[0].id); });
            var getSkillPromise = createSkillPromose.then(function (_skill) { return skillsDataHandler_1.SkillsDataHandler.getSkillByName(skillName); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getSkillPromise, skillInfo);
        });
    });
    describe('getSkills', function () {
        it('no skills should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkills();
            var expectedSkillsInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillsInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return all created skills', function () {
            var skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            var skillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('3');
            var createAllSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3, _users[0].id)
            ]); });
            var skillsPromise = createAllSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); });
            var expectedSkillsInfo = [skillInfo1, skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillsInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
    });
    describe('addSkillPrerequisite', function () {
        it('should create a skillPrerequisite', function () {
            var skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            var createAllSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, _users[0].id)
            ]); });
            var skillPrerequisitePromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                var skillPrerequisiteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
                return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
            });
            return chai_1.expect(skillPrerequisitePromise).to.eventually.fulfilled;
        });
    });
    describe('removeSkillPrerequisite', function () {
        var testModels;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.fillAllTables()
                .then(function (_testModels) {
                testModels = _testModels;
            });
        });
        it('not existing skill should not fail', function () {
            var prerequisiteToRemove = testModels.skillPrerequisites[0];
            var skillPrerequisiteId = prerequisiteToRemove.attributes.skill_prerequisite_id;
            var promise = skillsDataHandler_1.SkillsDataHandler.removeSkillPrerequisite(9999, skillPrerequisiteId);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('not existing skill prerequisite should not fail', function () {
            var prerequisiteToRemove = testModels.skillPrerequisites[0];
            var skillId = prerequisiteToRemove.attributes.skill_id;
            var promise = skillsDataHandler_1.SkillsDataHandler.removeSkillPrerequisite(skillId, 9999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing skill prerequisite should remove the prerequisite', function () {
            var prerequisiteToRemove = testModels.skillPrerequisites[0];
            var skillId = prerequisiteToRemove.attributes.skill_id;
            var skillPrerequisiteId = prerequisiteToRemove.attributes.skill_prerequisite_id;
            var promise = skillsDataHandler_1.SkillsDataHandler.removeSkillPrerequisite(skillId, skillPrerequisiteId);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites(); })
                .then(function (_prerequisites) {
                return _.map(_prerequisites, function (_) { return _.id; });
            })
                .then(function (_prerequisitesIds) {
                chai_1.expect(_prerequisitesIds).not.to.contain(prerequisiteToRemove.id);
            });
        });
    });
    describe('getSkillsPrerequisites', function () {
        it('no skill prerequisites should return empty', function () {
            var prerequisitesPromise = skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites();
            var expectedPrerequisitesInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(prerequisitesPromise, expectedPrerequisitesInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillPrerequisiteInfos);
        });
        it('should return all created skill prerequisites', function () {
            var skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            var createAllSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, _users[0].id)
            ]); });
            var skillPrerequisiteInfo1;
            var skillPrerequisiteInfo2;
            var createAllSkillPrerequisitesPromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                skillPrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
                skillPrerequisiteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
                return bluebirdPromise.all([
                    skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo1),
                    skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo2),
                ]);
            });
            var skillPrerequisitesPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites(); });
            return skillPrerequisitesPromise.then(function () {
                var expectedSkillPrerequisitesInfos = [skillPrerequisiteInfo1, skillPrerequisiteInfo2];
                return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillPrerequisitesPromise, expectedSkillPrerequisitesInfos, modelInfoComparers_1.ModelInfoComparers.compareSkillPrerequisiteInfos);
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
            skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            skillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('3');
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3, _users[0].id)
            ]); }).then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                skill3 = skills[2];
            });
        });
        it('no such skill should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(99999);
            var expectedInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('no skill prerequisites should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skill1.id);
            var expectedInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return all existing skill prerequisites', function () {
            var skill1PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3);
            var createAllSkillPrerequisitesPromise = bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skill1.id); });
            var expectedSkillsInfos = [skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillsInfos, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return all existing skill prerequisites and not return other prerequisites', function () {
            var skill1PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3);
            var skill2PrerequisiteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
            var createAllSkillPrerequisitesPromise = bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skill1.id); });
            var expectedSkillsInfos = [skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillsInfos, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
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
            skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            skillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('3');
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3, _users[0].id)
            ]); }).then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                skill3 = skills[2];
            });
        });
        it('no such skill should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillContributions(9999999);
            var expectedInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('no skill prerequisites should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill1.id);
            var expectedInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('no skill prerequisites leading to skill should return empty', function () {
            var skill1PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3);
            var createAllSkillPrerequisitesPromise = bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill1.id); });
            var expectedInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return all existing skills with prerequisites of this skill', function () {
            var skill2PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
            var skill3PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill3, skill1);
            var createAllSkillPrerequisitesPromise = bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill1.id); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillInfos, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return all existing skill with prerequisites of this skill and not return other skills', function () {
            var skill2PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
            var skill3PrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill3, skill1);
            var skill1PrerequisiteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
            var createAllSkillPrerequisitesPromise = bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill1.id); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillInfos, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
    });
    describe('getSkillsToPrerequisitesMap', function () {
        function createSkillPrerequisites(skillsToPrerequisites) {
            var skillPrerequisitePromises = [];
            skillsToPrerequisites.forEach(function (skillPrerequisite) {
                skillPrerequisite.prerequisiteSkillIds.forEach(function (_prerequisiteSkillId) {
                    var skillPrerequisiteInfo = {
                        skill_id: skillPrerequisite.skill.id,
                        skill_prerequisite_id: _prerequisiteSkillId
                    };
                    var skillPrerequisitePromise = skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
                    skillPrerequisitePromises.push(skillPrerequisitePromise);
                });
            });
            return bluebirdPromise.all(skillPrerequisitePromises);
        }
        function verifySkillsToPrerequisites(actual, expected) {
            chai_1.expect(actual.length).to.be.equal(expected.length);
            var actualSkills = _.map(actual, function (_) { return _.skill; });
            var expectedSkills = _.map(actual, function (_) { return _.skill; });
            modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(actualSkills, expectedSkills);
            verifySkillsToPrerequisitesHasCorrectPrerequisitesForEachSkill(actual, expected);
        }
        function verifySkillsToPrerequisitesHasCorrectPrerequisitesForEachSkill(actual, expected) {
            var actualSorted = _.orderBy(actual, function (_) { return _.skill.id; });
            var expectedSorted = _.orderBy(expected, function (_) { return _.skill.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualSkillTeamIds = actualSorted[0].prerequisiteSkillIds;
                var expectedSkillTeamIds = expectedSorted[0].prerequisiteSkillIds;
                chai_1.expect(actualSkillTeamIds.sort()).to.deep.equal(expectedSkillTeamIds.sort());
            }
        }
        it('no skills should return empty mapping', function () {
            var promise = skillsDataHandler_1.SkillsDataHandler.getSkillsToPrerequisitesMap();
            return chai_1.expect(promise).to.eventually.deep.equal([]);
        });
        it('has skills without teams should return correct result', function () {
            var numberOfSkills = 5;
            var skills;
            var expectedSkillsToPrerequisites;
            var addSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(numberOfSkills, _users[0].id); })
                .then(function (_skills) {
                skills = _skills;
                expectedSkillsToPrerequisites =
                    _.map(_skills, function (_skill) {
                        return {
                            skill: _skill,
                            prerequisiteSkillIds: []
                        };
                    });
                return _skills;
            });
            var promise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsToPrerequisitesMap(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_skillsToPrerequisites) {
                verifySkillsToPrerequisites(_skillsToPrerequisites, expectedSkillsToPrerequisites);
            });
        });
        it('has skills with teams knowing them should return correct result', function () {
            var numberOfSkills = 5;
            var skills;
            var addSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(numberOfSkills, _users[0].id); })
                .then(function (_skills) {
                skills = _skills;
                return _skills;
            });
            var expectedSkillsToPrerequisites;
            var addSkillPrerequisitesPromise = addSkillsPromise
                .then(function () {
                expectedSkillsToPrerequisites =
                    [
                        { skill: skills[0], prerequisiteSkillIds: [skills[1].id, skills[2].id, skills[3].id, skills[4].id] },
                        { skill: skills[1], prerequisiteSkillIds: [skills[0].id, skills[2].id, skills[4].id] },
                        { skill: skills[2], prerequisiteSkillIds: [skills[1].id, skills[3].id] },
                        { skill: skills[3], prerequisiteSkillIds: [skills[1].id, skills[2].id, skills[4].id] },
                        { skill: skills[4], prerequisiteSkillIds: [skills[1].id, skills[2].id, skills[3].id] },
                    ];
            })
                .then(function () { return createSkillPrerequisites(expectedSkillsToPrerequisites); });
            var promise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsToPrerequisitesMap(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_skillsToPrerequisites) {
                verifySkillsToPrerequisites(_skillsToPrerequisites, expectedSkillsToPrerequisites);
            });
        });
    });
    describe('getTeams', function () {
        function verifyTeamUpvotingUsersAsync(actualTeamsOfSkillPromise, expectedSkillUpdvotes) {
            return chai_1.expect(actualTeamsOfSkillPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var orderedActualTeams = _.orderBy(actualTeams, function (_) { return _.team.id; });
                var actualUpvodtingUserIds = _.map(orderedActualTeams, function (_) { return _.upvotingUserIds.sort(); });
                var orderedExpectedUpvotes = _.orderBy(expectedSkillUpdvotes, function (_) { return _.teamId; });
                var expectedUpvotingUserIds = _.map(orderedExpectedUpvotes, function (_) { return _.upvotingUserIds.sort(); });
                chai_1.expect(actualUpvodtingUserIds).to.deep.equal(expectedUpvotingUserIds);
            });
        }
        var teamInfo1;
        var teamInfo2;
        var teamInfo3;
        var skillInfo1;
        var skillInfo2;
        var team1;
        var team2;
        var team3;
        var skill1;
        var skill2;
        var userInfo1;
        var userInfo2;
        var user1;
        var user2;
        beforeEach(function () {
            teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            teamInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('c');
            skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ]).then(function (results) {
                user1 = results[0];
                user2 = results[1];
            }).then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1, user1.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2, user2.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo3, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, user2.id)
            ]); }).then(function (results) {
                team1 = results[0];
                team2 = results[1];
                team3 = results[2];
                skill1 = results[3];
                skill2 = results[4];
            });
        });
        it('no such skill should return empty teams list', function () {
            var teamsPromise = skillsDataHandler_1.SkillsDataHandler.getTeams(99999);
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('skill exists but has no teams should return empty teams list', function () {
            var teamsPromise = skillsDataHandler_1.SkillsDataHandler.getTeams(skill1.id);
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('skill exists with teams should return correct teams', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
            var addSkillsPromise = bluebirdPromise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2)
            ]);
            var teamsPromise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skill1.id); })
                .then(function (teamsOfASkill) {
                return _.map(teamsOfASkill, function (_) { return _.team; });
            });
            var expectedTeams = [teamInfo1, teamInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise, expectedTeams, modelInfoComparers_1.ModelInfoComparers.compareTeamInfos);
        });
        it('skill exists with teams should return correct upvoting user ids', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team3, skill1);
            var addSkillsPromise = bluebirdPromise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamsPromise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skill1.id); });
            var expectedSkillUpvotes = [
                { teamId: teamSkillInfo1.team_id, upvotingUserIds: [] },
                { teamId: teamSkillInfo2.team_id, upvotingUserIds: [] },
                { teamId: teamSkillInfo3.team_id, upvotingUserIds: [] }
            ];
            return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
        });
        it('multiple skills exist with teams should return correct teams', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var addSkillsPromise = bluebirdPromise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamsPromise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skill1.id); })
                .then(function (teamsOfASkill) {
                return _.map(teamsOfASkill, function (_) { return _.team; });
            });
            var expectedTeams = [teamInfo1, teamInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise, expectedTeams, modelInfoComparers_1.ModelInfoComparers.compareTeamInfos);
        });
        it('skill exists with teams with upvotes should return correct upvoting user ids', function () {
            var team1SkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var team2SkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
            var team3SkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team3, skill1);
            var addSkillsAndUpvote = bluebirdPromise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team1SkillInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team2SkillInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team3SkillInfo)
            ]).then(function (teamSkills) {
                var team1Skill = teamSkills[0], team2Skill = teamSkills[1], team3Skill = teamSkills[2];
                return bluebirdPromise.all([
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user1.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user2.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team2Skill.id, user2.id),
                ]);
            });
            var teamsPromise = addSkillsAndUpvote.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skill1.id); });
            var expectedSkillUpvotes = [
                { teamId: team1.id, upvotingUserIds: [user1.id, user2.id] },
                { teamId: team2.id, upvotingUserIds: [user2.id] },
                { teamId: team3.id, upvotingUserIds: [] }
            ];
            return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
        });
    });
    describe('getTeamsOfSkills', function () {
        function createTeamSkills(skillsToTeams) {
            var teamSkillPromises = [];
            skillsToTeams.forEach(function (_teamsOfASkill) {
                _teamsOfASkill.teamsIds.forEach(function (_teamId) {
                    var teamSkillInfo = {
                        team_id: _teamId,
                        skill_id: _teamsOfASkill.skill.id
                    };
                    var teamSkillPromise = teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
                    teamSkillPromises.push(teamSkillPromise);
                });
            });
            return bluebirdPromise.all(teamSkillPromises);
        }
        function verifySkillsToTeams(actual, expected) {
            chai_1.expect(actual.length).to.be.equal(expected.length);
            var actualSkills = _.map(actual, function (_) { return _.skill; });
            var expectedSkills = _.map(actual, function (_) { return _.skill; });
            modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(actualSkills, expectedSkills);
            verifySkillsToTeamsHasCorrectTeamsForEachSkill(actual, expected);
        }
        function verifySkillsToTeamsHasCorrectTeamsForEachSkill(actual, expected) {
            var actualSorted = _.orderBy(actual, function (_) { return _.skill.id; });
            var expectedSorted = _.orderBy(expected, function (_) { return _.skill.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualSkillTeamIds = actualSorted[0].teamsIds;
                var expectedSkillTeamIds = expectedSorted[0].teamsIds;
                chai_1.expect(actualSkillTeamIds.sort()).to.deep.equal(expectedSkillTeamIds.sort());
            }
        }
        it('no skills should return empty mapping', function () {
            var promise = skillsDataHandler_1.SkillsDataHandler.getTeamsOfSkills();
            return chai_1.expect(promise).to.eventually.deep.equal([]);
        });
        it('has skills without teams should return correct result', function () {
            var numberOfSkills = 5;
            var skills;
            var expectedSkillsToTeams;
            var addSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(numberOfSkills, _users[0].id); })
                .then(function (_skills) {
                skills = _skills;
                expectedSkillsToTeams =
                    _.map(_skills, function (_skill) {
                        return {
                            skill: _skill,
                            teamsIds: []
                        };
                    });
                return _skills;
            });
            var promise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeamsOfSkills(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_skillsToTeams) {
                verifySkillsToTeams(_skillsToTeams, expectedSkillsToTeams);
            });
        });
        it('has skills with teams knowing them should return correct result', function () {
            var user;
            var createUsersPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
            });
            var numberOfSkills = 3;
            var skills;
            var addSkillsPromise = createUsersPromise
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(numberOfSkills, user.id); })
                .then(function (_skills) {
                skills = _skills;
                return _skills;
            });
            var numberOfTeams = 5;
            var teams;
            var addTeamsPromise = createUsersPromise.then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(numberOfTeams, user.id); })
                .then(function (_teams) {
                teams = _teams;
                return _teams;
            });
            var expectedSkillsToTeams;
            var addTeamSkillsPromise = bluebirdPromise.all([addSkillsPromise, addTeamsPromise])
                .then(function () {
                expectedSkillsToTeams =
                    [
                        { skill: skills[0], teamsIds: [teams[0].id, teams[1].id, teams[2].id, teams[3].id, teams[4].id] },
                        { skill: skills[1], teamsIds: [teams[0].id, teams[2].id, teams[4].id] },
                        { skill: skills[2], teamsIds: [teams[1].id, teams[3].id] },
                    ];
            })
                .then(function () { return createTeamSkills(expectedSkillsToTeams); });
            var promise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeamsOfSkills(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_skillsToTeams) {
                verifySkillsToTeams(_skillsToTeams, expectedSkillsToTeams);
            });
        });
    });
    describe('getSkillsCreators', function () {
        var user1;
        var user2;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(2)
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1];
            });
        });
        it('no skills should return empty', function () {
            var promise = skillsDataHandler_1.SkillsDataHandler.getSkillsCreators();
            return chai_1.expect(promise).to.eventually.deep.equal([]);
        });
        it('skills created should return correct result', function () {
            var skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            var expected;
            var skillsPromise = bluebirdPromise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, user2.id)
            ]).then(function (_skills) {
                expected = [
                    {
                        user_id: user1.id,
                        skill_id: _skills[0].id
                    },
                    {
                        user_id: user2.id,
                        skill_id: _skills[1].id
                    }
                ];
            });
            var promise = skillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsCreators(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_creators) {
                return _.map(_creators, function (_) { return _.attributes; });
            })
                .then(function (_creatorsInfos) {
                modelInfoVerificator_1.ModelInfoVerificator.verifyMultipleInfosOrdered(_creatorsInfos, expected, modelInfoComparers_1.ModelInfoComparers.compareSkillsCreators);
            });
        });
    });
});
//# sourceMappingURL=skillsDataHandler.test.js.map