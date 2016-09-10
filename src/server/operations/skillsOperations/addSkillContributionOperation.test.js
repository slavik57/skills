"use strict";
var skillSelfPrerequisiteError_1 = require("../../../common/errors/skillSelfPrerequisiteError");
var errorUtils_1 = require("../../../common/errors/errorUtils");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var addSkillContributionOperation_1 = require('./addSkillContributionOperation');
chai.use(chaiAsPromised);
describe('AddSkillContributionOperation', function () {
    var executingUser;
    var operation;
    var skill;
    var skillContribution;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
            .then(function (_user) {
            executingUser = _user;
        });
        var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill');
        var skillContributionInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skillContribution');
        var createSkillPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
            .then(function (_users) { return Promise.all([
            skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, _users[0].id),
            skillsDataHandler_1.SkillsDataHandler.createSkill(skillContributionInfo, _users[0].id)
        ]); })
            .then(function (_skills) {
            skill = _skills[0], skillContribution = _skills[1];
            operation = new addSkillContributionOperation_1.AddSkillContributionOperation(skill.id, skillContribution.attributes.name, executingUser.id);
        });
        return Promise.all([
            userCreationPromise,
            createSkillPromise
        ]);
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('canExecute', function () {
        describe('executing user has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should reject', function () {
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is global admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should fulfil', function () {
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is skills list admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should fulfil', function () {
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
    });
    describe('execute', function () {
        describe('executing user has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should fail and not add contribution', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill.id); })
                    .then(function (_skillContributions) {
                    chai_1.expect(_skillContributions).to.be.length(0);
                });
            });
        });
        var sufficientPermissionsTests = function (permissionsToAdd) {
            return function () {
                beforeEach(function () {
                    return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissionsToAdd);
                });
                it('should succeed and add contribution', function () {
                    var resultPromise = operation.execute();
                    return chai_1.expect(resultPromise).to.eventually.fulfilled
                        .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skill.id); })
                        .then(function (_skills) {
                        chai_1.expect(_skills).to.be.length(1);
                        modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillContribution.attributes);
                    });
                });
                it('adding a skill contributuin as itself should fail correctly', function () {
                    var operation = new addSkillContributionOperation_1.AddSkillContributionOperation(skill.id, skill.attributes.name, executingUser.id);
                    return chai_1.expect(operation.execute()).to.eventually.rejected
                        .then(function (error) {
                        chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(error, skillSelfPrerequisiteError_1.SkillSelfPrerequisiteError)).to.be.true;
                    });
                });
            };
        };
        describe('executing user is ADMIN', sufficientPermissionsTests([globalPermission_1.GlobalPermission.ADMIN]));
        describe('executing user is SKILLS_LIST_ADMIN', sufficientPermissionsTests([globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]));
    });
});
//# sourceMappingURL=addSkillContributionOperation.test.js.map