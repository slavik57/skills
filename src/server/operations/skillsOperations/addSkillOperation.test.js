"use strict";
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
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
var addSkillOperation_1 = require('./addSkillOperation');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('AddSkillOperation', function () {
    var skillInfoToAdd;
    var executingUser;
    var existingSkill;
    var operation;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        skillInfoToAdd = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill');
        var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
            .then(function (_user) {
            executingUser = _user;
        })
            .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(1, executingUser.id); })
            .then(function (_skills) {
            existingSkill = _skills[0];
        })
            .then(function () {
            operation = new addSkillOperation_1.AddSkillOperation(executingUser.id, skillInfoToAdd);
        });
        return userCreationPromise;
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
            it('should fail', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
        describe('executing user is ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('adding existing skill should fail', function () {
                var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);
                var operation = new addSkillOperation_1.AddSkillOperation(executingUser.id, skillInfo);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
        describe('executing user is SKILLS_LIST_ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('adding existing skill should fail', function () {
                var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);
                var operation = new addSkillOperation_1.AddSkillOperation(executingUser.id, skillInfo);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
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
            it('should fail and not add skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillByName(skillInfoToAdd.name); })
                    .then(function (_skill) {
                    chai_1.expect(_skill).to.not.exist;
                });
            });
        });
        describe('executing user is ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed and add skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillByName(skillInfoToAdd.name); })
                    .then(function (_skill) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skill.attributes, skillInfoToAdd);
                });
            });
            it('should add the user as skill creator', function () {
                var resultPromise = operation.execute();
                var skill;
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_skill) {
                    skill = _skill;
                })
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsCreators(); })
                    .then(function (_skillsCreators) {
                    return _.find(_skillsCreators, function (_) { return _.attributes.skill_id === skill.id; });
                })
                    .then(function (_skillsCreator) {
                    var expectedSkillCreatorInfo = {
                        user_id: executingUser.id,
                        skill_id: skill.id
                    };
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skillsCreator.attributes, expectedSkillCreatorInfo);
                });
            });
            it('adding existing skill should fail', function () {
                var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);
                var operation = new addSkillOperation_1.AddSkillOperation(executingUser.id, skillInfo);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
        describe('executing user is SKILLS_LIST_ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed and add skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillByName(skillInfoToAdd.name); })
                    .then(function (_skill) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skill.attributes, skillInfoToAdd);
                });
            });
            it('should add the user as skill creator', function () {
                var resultPromise = operation.execute();
                var skill;
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_skill) {
                    skill = _skill;
                })
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsCreators(); })
                    .then(function (_skillsCreators) {
                    return _.find(_skillsCreators, function (_) { return _.attributes.skill_id === skill.id; });
                })
                    .then(function (_skillsCreator) {
                    var expectedSkillCreatorInfo = {
                        user_id: executingUser.id,
                        skill_id: skill.id
                    };
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skillsCreator.attributes, expectedSkillCreatorInfo);
                });
            });
            it('adding existing skill should fail', function () {
                var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);
                var operation = new addSkillOperation_1.AddSkillOperation(executingUser.id, skillInfo);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
    });
});
//# sourceMappingURL=addSkillOperation.test.js.map