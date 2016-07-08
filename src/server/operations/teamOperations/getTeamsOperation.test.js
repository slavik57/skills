"use strict";
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getTeamsOperation_1 = require('./getTeamsOperation');
chai.use(chaiAsPromised);
describe('GetTeamsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var teams;
        var operation;
        beforeEach(function () {
            var createTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(4, _users[0].id); })
                .then(function (_teams) {
                teams = _teams;
            });
            return createTeamsPromise.then(function () {
                operation = new getTeamsOperation_1.GetTeamsOperation();
            });
        });
        it('should return correct teams', function () {
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualTeams) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualTeams, teams);
            });
        });
    });
});
//# sourceMappingURL=getTeamsOperation.test.js.map