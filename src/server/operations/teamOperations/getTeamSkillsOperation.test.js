"use strict";
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getTeamSkillsOperation_1 = require('./getTeamSkillsOperation');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('GetTeamSkillsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var team;
        var teamSkill1;
        var teamSkill2;
        var teamSkill3;
        var user1;
        var user2;
        var user3;
        var teamSkill1UpvotingUserIds;
        var teamSkill2UpvotingUserIds;
        var teamSkill3UpvotingUserIds;
        var operation;
        beforeEach(function () {
            var createUsersPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(3)
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1], user3 = _users[2];
            });
            var createTeamPromise = createUsersPromise
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(1, user1.id); })
                .then(function (_teams) {
                team = _teams[0];
            });
            var createSkillsPromise = createUsersPromise
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(3, user1.id); })
                .then(function (_skills) {
                teamSkill1 = _skills[0], teamSkill2 = _skills[1], teamSkill3 = _skills[2];
            });
            return Promise.all([
                createTeamPromise,
                createSkillsPromise
            ]).then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, teamSkill1)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, teamSkill2)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, teamSkill3))
            ]); }).then(function (_teamSkills) { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkills[0].id, user1.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkills[0].id, user2.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkills[1].id, user1.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkills[1].id, user3.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkills[2].id, user2.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkills[2].id, user3.id)
            ]); }).then(function () {
                teamSkill1UpvotingUserIds = [user1.id, user2.id];
                teamSkill2UpvotingUserIds = [user1.id, user3.id];
                teamSkill3UpvotingUserIds = [user2.id, user3.id];
                operation = new getTeamSkillsOperation_1.GetTeamSkillsOperation(team.id);
            });
        });
        it('should return correct skills', function () {
            var resultPromise = operation.execute();
            var expectedSkills = [teamSkill1, teamSkill2, teamSkill3];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualTeamSkills) {
                var actualSkills = _.map(_actualTeamSkills, function (_) { return _.skill; });
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(actualSkills, expectedSkills);
            });
        });
        it('should return correct upvoted users', function () {
            var resultPromise = operation.execute();
            var expected = [
                { skill: teamSkill1, upvotingUserIds: teamSkill1UpvotingUserIds, teamSkill: null },
                { skill: teamSkill2, upvotingUserIds: teamSkill2UpvotingUserIds, teamSkill: null },
                { skill: teamSkill3, upvotingUserIds: teamSkill3UpvotingUserIds, teamSkill: null }
            ];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualTeamSkills) {
                var actualTeamSkillsOrdered = _.orderBy(_actualTeamSkills, function (_) { return _.skill.id; });
                var expectedTeamSkillsOrdered = _.orderBy(expected, function (_) { return _.skill.id; });
                var actualUpvotingUserIds = _.map(actualTeamSkillsOrdered, function (_) { return _.upvotingUserIds; });
                var expectedUpvotingUserIds = _.map(expectedTeamSkillsOrdered, function (_) { return _.upvotingUserIds; });
                chai_1.expect(actualUpvotingUserIds.length).to.be.equal(expectedUpvotingUserIds.length);
                for (var i = 0; i < expectedUpvotingUserIds.length; i++) {
                    chai_1.expect(actualUpvotingUserIds[i].sort()).to.deep.equal(expectedUpvotingUserIds[i].sort());
                }
            });
        });
    });
});
//# sourceMappingURL=getTeamSkillsOperation.test.js.map