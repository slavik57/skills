"use strict";
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getSkillContributionsOperation_1 = require('./getSkillContributionsOperation');
chai.use(chaiAsPromised);
describe('GetSkillContributionsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var skill;
        var skillContribution1;
        var skillContribution2;
        var skillContribution3;
        var operation;
        beforeEach(function () {
            var createSkillContributionsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(4, _users[0].id); })
                .then(function (_skills) {
                skill = _skills[0], skillContribution1 = _skills[1], skillContribution2 = _skills[2], skillContribution3 = _skills[3];
            }).then(function () { return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skillContribution1, skill)),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skillContribution2, skill)),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skillContribution3, skill))
            ]); });
            return createSkillContributionsPromise
                .then(function () {
                operation = new getSkillContributionsOperation_1.GetSkillContributionsOperation(skill.id);
            });
        });
        it('should return correct contributions succeed', function () {
            var resultPromise = operation.execute();
            var expectedContributions = [skillContribution1, skillContribution2, skillContribution3];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualContributions) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualContributions, expectedContributions);
            });
        });
    });
});
//# sourceMappingURL=getSkillContributionsOperation.test.js.map