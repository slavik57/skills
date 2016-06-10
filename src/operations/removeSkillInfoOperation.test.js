"use strict";
var skillsDataHandler_1 = require("../dataHandlers/skillsDataHandler");
var globalPermission_1 = require("../models/enums/globalPermission");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var removeSkillInfoOperation_1 = require('./removeSkillInfoOperation');
chai.use(chaiAsPromised);
describe('RemoveSkillOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var executingUser;
        var operation;
        var skillToRemove;
        beforeEach(function () {
            var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
                .then(function (_user) {
                executingUser = _user;
            });
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill');
            var createSkillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo)
                .then(function (_skill) {
                skillToRemove = _skill;
                operation = new removeSkillInfoOperation_1.RemoveSkillOperation(executingUser.id, skillToRemove.id);
            });
            return Promise.all([
                userCreationPromise,
                createSkillPromise
            ]);
        });
        describe('executing user has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should fail and not remove skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); })
                    .then(function (_skills) {
                    chai_1.expect(_skills).to.be.length(1);
                    chai_1.expect(_skills[0].id).to.be.equal(skillToRemove.id);
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
            it('should succeed and remove skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); })
                    .then(function (_skills) {
                    chai_1.expect(_skills).to.be.length(0);
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
            it('should succeed and remove skill', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); })
                    .then(function (_skills) {
                    chai_1.expect(_skills).to.be.length(0);
                });
            });
        });
    });
});
