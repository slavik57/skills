"use strict";
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
var skillsDataHandler_1 = require("../dataHandlers/skillsDataHandler");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var teamSkillUpvote_1 = require('./teamSkillUpvote');
chai.use(chaiAsPromised);
describe('TeamSkillUpvote', function () {
    describe('new', function () {
        var skill;
        var team;
        var user1;
        var user2;
        var teamSkill;
        beforeEach(function () {
            return environmentCleaner_1.EnvironmentCleaner.clearTables()
                .then(function () { return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1')),
                teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1')),
                userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
                userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
            ]); })
                .then(function (results) {
                skill = results[0], team = results[1], user1 = results[2], user2 = results[3];
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill)),
                ]);
            }).then(function (teamSkills) {
                teamSkill = teamSkills[0];
            });
        });
        afterEach(function () {
            return environmentCleaner_1.EnvironmentCleaner.clearTables();
        });
        it('create without any fields should return error', function () {
            var teamSkillUpvote = new teamSkillUpvote_1.TeamSkillUpvote();
            var promise = teamSkillUpvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without team_skill_id should return error', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            delete upvoteInfo.team_skill_id;
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without user_id should return error', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            delete upvoteInfo.user_id;
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer team_skill_id should return error', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            upvoteInfo.team_skill_id = 1.1;
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer user_id should return error', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            upvoteInfo.user_id = 1.1;
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing team_skill_id should return error', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            upvoteInfo.team_skill_id = 99999;
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing user_id should return error', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            upvoteInfo.user_id = 99999;
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing team_skill_id and user_id should succeed', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            return chai_1.expect(promise).to.eventually.equal(upvote);
        });
        it('create with existing team_skill_id and user_id should be fetched', function () {
            var upvoteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            var upvote = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo);
            var promise = upvote.save();
            var upvotesPromise = promise.then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); });
            return chai_1.expect(upvotesPromise).to.eventually.fulfilled
                .then(function (upvotes) {
                var upvote = upvotes.at(0);
                chai_1.expect(upvotes.size()).to.be.equal(1);
                chai_1.expect(upvote.attributes.team_skill_id).to.be.equal(upvoteInfo.team_skill_id);
                chai_1.expect(upvote.attributes.user_id).to.be.equal(upvoteInfo.user_id);
            });
        });
        it('create 2 different team skills should succeed', function () {
            var upvoteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            var upvoteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user2);
            var upvote1 = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo1);
            var upvote2 = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo2);
            var promise = upvote1.save()
                .then(function () { return upvote2.save(); });
            return chai_1.expect(promise).to.eventually.equal(upvote2);
        });
        it('create 2 different team skills should be fetched', function () {
            var upvoteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            var upvoteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user2);
            var upvote1 = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo1);
            var upvote2 = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo2);
            var promise = upvote1.save()
                .then(function () { return upvote2.save(); });
            var upvotesPromise = promise.then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); });
            return chai_1.expect(upvotesPromise).to.eventually.fulfilled
                .then(function (upvotes) {
                chai_1.expect(upvotes.size()).to.be.equal(2);
            });
        });
        it('create 2 same skills should return error', function () {
            var upvoteInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            var upvoteInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
            var upvote1 = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo1);
            var upvote2 = new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo2);
            var promise = upvote1.save()
                .then(function () { return upvote2.save(); });
            return chai_1.expect(promise).to.eventually.rejected;
        });
    });
});
describe('TeamSkillUpvotes', function () {
    describe('clearAll', function () {
        it('should clear all the team skill upvotes', function () {
            var promise = teamSkillUpvote_1.TeamSkillUpvotes.clearAll();
            var upvotesPromise = promise.then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); });
            return chai_1.expect(upvotesPromise).to.eventually.fulfilled
                .then(function (teamSkills) {
                chai_1.expect(teamSkills.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = teamSkillUpvote_1.TeamSkillUpvotes.clearAll().then(function () { return teamSkillUpvote_1.TeamSkillUpvotes.clearAll(); });
            var upvotesPromise = promise.then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); });
            return chai_1.expect(upvotesPromise).to.eventually.fulfilled;
        });
    });
});
