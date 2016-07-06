"use strict";
var getSkillsKnowledgeStatisticsOperation_1 = require("./getSkillsKnowledgeStatisticsOperation");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
var bluebirdPromise = require('bluebird');
chai.use(chaiAsPromised);
describe('GetSkillsKnowledgeStatisticsOperation', function () {
    var operation;
    beforeEach(function () {
        operation = new getSkillsKnowledgeStatisticsOperation_1.GetSkillsKnowledgeStatisticsOperation();
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var teams;
        var team1;
        var team2;
        var team3;
        var skill1;
        var skill2;
        var skill3;
        var skill1KnowingTeams;
        var skill2KnowingTeams;
        var skill3KnowingTeams;
        beforeEach(function () {
            var createTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createTeams(3)
                .then(function (_teams) {
                teams = _teams;
                team1 = _teams[0], team2 = _teams[1], team3 = _teams[2];
            });
            var createSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(3, _users[0].id); })
                .then(function (_skills) {
                skill1 = _skills[0], skill2 = _skills[1], skill3 = _skills[2];
            });
            var createTeamSkillsPromise = bluebirdPromise.all([createTeamsPromise, createSkillsPromise])
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill3)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill3)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team3, skill3))
            ]); })
                .then(function () {
                skill1KnowingTeams = [team1, team2];
                skill2KnowingTeams = [];
                skill3KnowingTeams = [team1, team2, team3];
            });
            return createTeamSkillsPromise;
        });
        function vefifySkillKnowledgeStatistics(actual, expected) {
            chai_1.expect(actual.length, 'The number of statistics shouls be correct').to.be.equal(expected.length);
            var actualSorted = _.orderBy(actual, function (_) { return _.skill.id; });
            var expectedSorted = _.orderBy(expected, function (_) { return _.skill.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualStatistics = actualSorted[i];
                var expectedStatistics = expectedSorted[i];
                var expectedSkillName = expectedStatistics.skill.attributes.name;
                chai_1.expect(actualStatistics.skill.id, 'Should contain skill: ' + expectedSkillName).to.be.equal(expectedStatistics.skill.id);
                chai_1.expect(actualStatistics.numberOfKnowingTeams, 'numberOfKnowingTeams for skill [' + expectedSkillName + '] should be correct').to.be.equal(expectedStatistics.numberOfKnowingTeams);
                chai_1.expect(actualStatistics.numberOfNotKnowingTeams, 'numberOfNotKnowingTeams for skill [' + expectedSkillName + '] should be correct').to.be.equal(expectedStatistics.numberOfNotKnowingTeams);
            }
        }
        it('should return correct result', function () {
            var expectedStatistices = [
                {
                    skill: skill1,
                    numberOfKnowingTeams: skill1KnowingTeams.length,
                    numberOfNotKnowingTeams: teams.length - skill1KnowingTeams.length
                },
                {
                    skill: skill2,
                    numberOfKnowingTeams: skill2KnowingTeams.length,
                    numberOfNotKnowingTeams: teams.length - skill2KnowingTeams.length
                },
                {
                    skill: skill3,
                    numberOfKnowingTeams: skill3KnowingTeams.length,
                    numberOfNotKnowingTeams: teams.length - skill3KnowingTeams.length
                }
            ];
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualStatistics) {
                vefifySkillKnowledgeStatistics(_actualStatistics, expectedStatistices);
            });
        });
    });
});
//# sourceMappingURL=getSkillsKnowledgeStatisticsOperation.test.js.map