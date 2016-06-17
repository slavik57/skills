"use strict";
var skillPrerequisitesVerificator_1 = require("../../testUtils/skillPrerequisitesVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getSkillsPrerequisitesOperation_1 = require('./getSkillsPrerequisitesOperation');
chai.use(chaiAsPromised);
describe('GetSkillsPrerequisitesOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var skills;
        var skill1;
        var skill2;
        var skill3;
        var skill1PrerequisitesIds;
        var skill2PrerequisitesIds;
        var skill3PrerequisitesIds;
        var operation;
        beforeEach(function () {
            var createSkillPrerequisitesPromise = environmentDirtifier_1.EnvironmentDirtifier.createSkills(3)
                .then(function (_skills) {
                skills = _skills;
                skill1 = _skills[0], skill2 = _skills[1], skill3 = _skills[2];
            }).then(function () { return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2)),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3)),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill3)),
            ]); }).then(function () {
                skill1PrerequisitesIds = [skill2.id, skill3.id];
                skill2PrerequisitesIds = [skill3.id];
                skill3PrerequisitesIds = [];
            });
            return createSkillPrerequisitesPromise
                .then(function () {
                operation = new getSkillsPrerequisitesOperation_1.GetSkillsPrerequisitesOperation();
            });
        });
        it('should return correct prerequisites succeed', function () {
            var resultPromise = operation.execute();
            var expectedPrerequisites = [
                { skill: skill1, prerequisiteSkillIds: skill1PrerequisitesIds },
                { skill: skill2, prerequisiteSkillIds: skill2PrerequisitesIds },
                { skill: skill3, prerequisiteSkillIds: skill3PrerequisitesIds }
            ];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualPrerequisites) {
                skillPrerequisitesVerificator_1.SkillPrerquisitesVerificator.verifySkillsPrerequisites(_actualPrerequisites, expectedPrerequisites);
            });
        });
    });
});
//# sourceMappingURL=getSkillsPrerequisitesOperation.test.js.map