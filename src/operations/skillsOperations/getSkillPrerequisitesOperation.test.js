"use strict";
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getSkillPrerequisitesOperation_1 = require('./getSkillPrerequisitesOperation');
chai.use(chaiAsPromised);
describe('GetSkillPrerequisitesOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var skill;
        var skillPrerequisite1;
        var skillPrerequisite2;
        var skillPrerequisite3;
        var operation;
        beforeEach(function () {
            var createSkillPrerequisitesPromise = environmentDirtifier_1.EnvironmentDirtifier.createSkills(4)
                .then(function (_skills) {
                skill = _skills[0], skillPrerequisite1 = _skills[1], skillPrerequisite2 = _skills[2], skillPrerequisite3 = _skills[3];
            }).then(function () { return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite1)),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite2)),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite3))
            ]); });
            return createSkillPrerequisitesPromise
                .then(function () {
                operation = new getSkillPrerequisitesOperation_1.GetSkillPrerequisitesOperation(skill.id);
            });
        });
        it('should return correct prerequisites succeed', function () {
            var resultPromise = operation.execute();
            var expectedPrerequisites = [skillPrerequisite1, skillPrerequisite2, skillPrerequisite3];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualPrerequisites) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualPrerequisites, expectedPrerequisites);
            });
        });
    });
});
