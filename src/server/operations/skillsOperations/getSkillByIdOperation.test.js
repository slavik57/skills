"use strict";
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getSkillByIdOperation_1 = require('./getSkillByIdOperation');
chai.use(chaiAsPromised);
describe('GetSkillByIdOperation', function () {
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
        describe('existing skill', function () {
            var skill;
            var operation;
            beforeEach(function () {
                var createSkillPromise = environmentDirtifier_1.EnvironmentDirtifier.createSkills(1, executingUser.id)
                    .then(function (_skills) {
                    skill = _skills[0];
                });
                return createSkillPromise.then(function () {
                    operation = new getSkillByIdOperation_1.GetSkillByIdOperation(skill.id);
                });
            });
            it('should return correct skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_actualSkill) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_actualSkill.attributes, skill.attributes);
                });
            });
        });
        describe('not existing skill', function () {
            var operation;
            beforeEach(function () {
                operation = new getSkillByIdOperation_1.GetSkillByIdOperation(12321);
            });
            it('should return null', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_actualSkill) {
                    chai_1.expect(_actualSkill).to.not.exist;
                });
            });
        });
    });
});
//# sourceMappingURL=getSkillByIdOperation.test.js.map