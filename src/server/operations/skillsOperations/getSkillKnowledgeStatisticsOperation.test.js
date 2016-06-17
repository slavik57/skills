"use strict";
var getSkillKnowledgeStatisticsOperation_1 = require("./getSkillKnowledgeStatisticsOperation");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('GetSkillKnowledgeStatisticsOperation', function () {
    beforeEach(function () {
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
        var skill;
        var skillKnowingTeams;
        var operation;
        beforeEach(function () {
            var createTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createTeams(3)
                .then(function (_teams) {
                teams = _teams;
                team1 = _teams[0], team2 = _teams[1], team3 = _teams[2];
            });
            var createSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createSkills(1)
                .then(function (_skills) {
                skill = _skills[0];
            });
            var createTeamSkillsPromise = Promise.all([createTeamsPromise, createSkillsPromise])
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill)),
            ]); })
                .then(function () {
                skillKnowingTeams = [team1, team2];
            });
            return createTeamSkillsPromise
                .then(function () {
                operation = new getSkillKnowledgeStatisticsOperation_1.GetSkillKnowledgeStatisticsOperation(skill.id);
            });
        });
        function vefifySkillKnowledgeStatistics(actual, expected) {
            chai_1.expect(actual.numberOfKnowingTeams, 'numberOfKnowingTeams should be correct').to.be.equal(expected.numberOfKnowingTeams);
            chai_1.expect(actual.numberOfNotKnowingTeams, 'numberOfNotKnowingTeams should be correct').to.be.equal(expected.numberOfNotKnowingTeams);
        }
        it('should return correct result', function () {
            var expectedStatistices = {
                numberOfKnowingTeams: skillKnowingTeams.length,
                numberOfNotKnowingTeams: teams.length - skillKnowingTeams.length
            };
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualStatistics) {
                vefifySkillKnowledgeStatistics(_actualStatistics, expectedStatistices);
            });
        });
    });
});
//# sourceMappingURL=getSkillKnowledgeStatisticsOperation.test.js.map