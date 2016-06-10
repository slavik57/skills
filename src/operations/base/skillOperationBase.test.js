"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var skillOperationBase_1 = require('./skillOperationBase');
chai.use(chaiAsPromised);
var TestSkillOperationBase = (function (_super) {
    __extends(TestSkillOperationBase, _super);
    function TestSkillOperationBase(executingUserId) {
        _super.call(this, executingUserId);
        this.wasExecuted = false;
    }
    TestSkillOperationBase.prototype.doWork = function () {
        this.wasExecuted = true;
    };
    return TestSkillOperationBase;
}(skillOperationBase_1.SkillOperationBase));
describe('SkillOperationBase', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var executingUser;
        var operation;
        beforeEach(function () {
            var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
                .then(function (_user) {
                executingUser = _user;
                operation = new TestSkillOperationBase(executingUser.id);
            });
            return userCreationPromise;
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
            it('should fail and not execute', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
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
            it('should succeed and execute', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
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
            it('should succeed and execute', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
        });
    });
});
