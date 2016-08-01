"use strict";
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getTeamByNameOperation_1 = require('./getTeamByNameOperation');
chai.use(chaiAsPromised);
describe('GetTeamByNameOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var executingUser;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                executingUser = _users[0];
            });
        });
        describe('existing team', function () {
            var team;
            var operation;
            beforeEach(function () {
                var createTeamPromise = environmentDirtifier_1.EnvironmentDirtifier.createTeams(1, executingUser.id)
                    .then(function (_team) {
                    team = _team[0];
                });
                return createTeamPromise.then(function () {
                    operation = new getTeamByNameOperation_1.GetTeamByNameOperation(team.attributes.name);
                });
            });
            it('should return correct team', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_actualTeam) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_actualTeam.attributes, team.attributes);
                });
            });
        });
        describe('not existing team', function () {
            var operation;
            beforeEach(function () {
                operation = new getTeamByNameOperation_1.GetTeamByNameOperation('not existing team');
            });
            it('should return null', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_actualTeam) {
                    chai_1.expect(_actualTeam).to.not.exist;
                });
            });
        });
    });
});
//# sourceMappingURL=getTeamByNameOperation.test.js.map