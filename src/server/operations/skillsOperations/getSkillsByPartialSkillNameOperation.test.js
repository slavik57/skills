"use strict";
var getSkillsByPartialSkillNameOperation_1 = require("./getSkillsByPartialSkillNameOperation");
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('GetSkillsByPartialSkillNameOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var skills;
        var skillSuffix;
        beforeEach(function () {
            skillSuffix = '_GetSkillsByPartialSkillNameOperation';
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(4, _users[0].id, skillSuffix); })
                .then(function (_skills) {
                skills = _skills;
            });
        });
        it('getting by "skill2" should return correct skill', function () {
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation('skill2');
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, [skills[2]]);
            });
        });
        it('getting by "skill3" should return correct skill', function () {
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation('skill3');
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, [skills[3]]);
            });
        });
        it('getting by skillSuffix should return correct skills', function () {
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation(skillSuffix);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
            });
        });
        it('getting by skillSuffix with null max skills should return correct skills', function () {
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation(skillSuffix, null);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
            });
        });
        it('getting by skillSuffix with undefined max skills should return correct skills', function () {
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation(skillSuffix, undefined);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
            });
        });
        it('getting by skillSuffix with limited number of skills to 0 should return no skills', function () {
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation(skillSuffix, 0);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                chai_1.expect(_actualSkills).to.be.length(0);
            });
        });
        it('getting by skillSuffix with limited number of skills should return correct skills', function () {
            var maxNumberOfSkills = 1;
            var operation = new getSkillsByPartialSkillNameOperation_1.GetSkillsByPartialSkillNameOperation(skillSuffix, maxNumberOfSkills);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualSkills) {
                chai_1.expect(_actualSkills).to.be.length(maxNumberOfSkills);
                _actualSkills.forEach(function (_skill) {
                    chai_1.expect(_skill.attributes.name).to.contain(skillSuffix);
                });
            });
        });
    });
});
//# sourceMappingURL=getSkillsByPartialSkillNameOperation.test.js.map