"use strict";
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getSkillsOperation_1 = require('./getSkillsOperation');
chai.use(chaiAsPromised);
describe('GetSkillsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var skills;
        var operation;
        beforeEach(function () {
            var createSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(4, _users[0].id); })
                .then(function (_skills) {
                skills = _skills;
            });
            return createSkillsPromise.then(function () {
                operation = new getSkillsOperation_1.GetSkillsOperation();
            });
        });
        it('should return correct skills', function () {
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
            });
        });
    });
});
//# sourceMappingURL=getSkillsOperation.test.js.map