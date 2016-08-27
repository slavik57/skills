"use strict";
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
var addSkillPrerequisiteOperation_1 = require('./addSkillPrerequisiteOperation');
chai.use(chaiAsPromised);
describe('AddSkillPrerequisiteOperation', function () {
    var executingUser;
    var operation;
    var skill;
    var skillPrerequisite;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
            .then(function (_user) {
            executingUser = _user;
        });
        var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill');
        var skillPrerequisiteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skillPrerequisite');
        var createSkillPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
            .then(function (_users) { return Promise.all([
            skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, _users[0].id),
            skillsDataHandler_1.SkillsDataHandler.createSkill(skillPrerequisiteInfo, _users[0].id)
        ]); })
            .then(function (_skills) {
            skill = _skills[0], skillPrerequisite = _skills[1];
            operation = new addSkillPrerequisiteOperation_1.AddSkillPrerequisiteOperation(skill.id, skillPrerequisite.attributes.name, executingUser.id);
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
            it('should fail and not add prerequisite', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skill.id); })
                    .then(function (_skillPrerequisites) {
                    chai_1.expect(_skillPrerequisites).to.be.length(0);
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
            it('should succeed and add prerequisite', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skill.id); })
                    .then(function (_skills) {
                    chai_1.expect(_skills).to.be.length(1);
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillPrerequisite.attributes);
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
            it('should succeed and add prerequisite', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skill.id); })
                    .then(function (_skills) {
                    chai_1.expect(_skills).to.be.length(1);
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillPrerequisite.attributes);
                });
            });
        });
    });
});
//# sourceMappingURL=addSkillPrerequisiteOperation.test.js.map