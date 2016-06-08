"use strict";
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoComparers_1 = require("../testUtils/modelInfoComparers");
var modelVerificator_1 = require("../testUtils/modelVerificator");
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
chai.use(chaiAsPromised);
describe('SkillsDataHandler', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('createSkill', function () {
        it('should create a skill correctly', function () {
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo);
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(skillPromise, skillInfo);
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
    });
    describe('getSkill', function () {
        it('no such skill should return null', function () {
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.getSkill(1234);
            return chai_1.expect(skillPromise).to.eventually.null;
        });
        it('skill exists should return correct skill', function () {
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var createSkillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo);
            var getSkillPromise = createSkillPromise.then(function (skill) { return skillsDataHandler_1.SkillsDataHandler.getSkill(skill.id); });
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
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]);
            var skillsPromise = createAllSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); });
            var expectedSkillsInfo = [skillInfo1, skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillsInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
    });
    describe('addSkillPrerequisite', function () {
        it('should create a skillPrerequisite', function () {
            var skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('1');
            var skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('2');
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2)
            ]);
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
        it('not existing skill prerequisite should not fail', function () {
            var promise = skillsDataHandler_1.SkillsDataHandler.removeSkillPrerequisite(9999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing skill prerequisite should remove the prerequisite', function () {
            var prerequisiteToRemove = testModels.skillPrerequisites[0];
            var promise = skillsDataHandler_1.SkillsDataHandler.removeSkillPrerequisite(prerequisiteToRemove.id);
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
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2)
            ]);
            var skillPrerequisiteInfo1;
            var skillPrerequisiteInfo2;
            var createAllSkillPrerequisitesPromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                skillPrerequisiteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2);
                skillPrerequisiteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill1);
                return Promise.all([
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
            var createAllSkillPrerequisitesPromise = Promise.all([
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
            var createAllSkillPrerequisitesPromise = Promise.all([
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
            var createAllSkillPrerequisitesPromise = Promise.all([
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
            var createAllSkillPrerequisitesPromise = Promise.all([
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
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill1.id); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillInfos, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
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
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo3),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ]).then(function (results) {
                team1 = results[0];
                team2 = results[1];
                team3 = results[2];
                skill1 = results[3];
                skill2 = results[4];
                user1 = results[5];
                user2 = results[6];
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
            var addSkillsPromise = Promise.all([
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
            var addSkillsPromise = Promise.all([
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
            var addSkillsPromise = Promise.all([
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
            var addSkillsAndUpvote = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team1SkillInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team2SkillInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team3SkillInfo)
            ]).then(function (teamSkills) {
                var team1Skill = teamSkills[0], team2Skill = teamSkills[1], team3Skill = teamSkills[2];
                return Promise.all([
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
});
