"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var getAllowedUserPermissionsToModifyOperation_1 = require("../userOperations/getAllowedUserPermissionsToModifyOperation");
var modifyUserPermissionsOperationBase_1 = require("./modifyUserPermissionsOperationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var TestModifyUserPermissionsOperationBase = (function (_super) {
    __extends(TestModifyUserPermissionsOperationBase, _super);
    function TestModifyUserPermissionsOperationBase(userIdToAddPermissionsTo, permissionsToModify, executingUserId) {
        _super.call(this, userIdToAddPermissionsTo, permissionsToModify, executingUserId);
        this.wasExecuted = false;
    }
    TestModifyUserPermissionsOperationBase.prototype.doWork = function () {
        this.wasExecuted = true;
        return null;
    };
    return TestModifyUserPermissionsOperationBase;
}(modifyUserPermissionsOperationBase_1.ModifyUserPermissionsOperationBase));
describe('ModifyUserPermissionsOperationBase', function () {
    var userToModifyPermissionsOf;
    var executingUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
        ]); }).then(function (_users) {
            executingUser = _users[0], userToModifyPermissionsOf = _users[1];
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        describe('executing user is ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
            });
            it('modifying all permissions should execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('modifying all permissions the user can add should execute', function () {
                var permissionsToModify;
                var operation;
                var permissionsToModifyPromise = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
                    .then(function (_permissions) {
                    permissionsToModify = _permissions;
                    operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                });
                var resultPromise = permissionsToModifyPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
        });
        describe('executing user is TEAMS_LIST_ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
            });
            it('modifying TEAMS_LIST_ADMIN permissions should succeed', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('modifying SKILLS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying all permissions the user can add should add execute', function () {
                var permissionsToModify;
                var operation;
                var permissionsToModifyPromise = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
                    .then(function (_permissions) {
                    permissionsToModify = _permissions;
                    operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                });
                var resultPromise = permissionsToModifyPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
        });
        describe('executing user is SKILLS_LIST_ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
            });
            it('modifying SKILLS_LIST_ADMIN permissions should execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('modifying TEAMS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying all permissions the user can add should execute', function () {
                var permissionsToModify;
                var operation;
                var permissionsToModifyPromise = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
                    .then(function (_permissions) {
                    permissionsToModify = _permissions;
                    operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                });
                var resultPromise = permissionsToModifyPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
        });
        describe('executing user is READER', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.READER]);
            });
            it('modifying TEAMS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying all permissions the user can add should execute', function () {
                var permissionsToModify;
                var operation;
                var permissionsToModifyPromise = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
                    .then(function (_permissions) {
                    permissionsToModify = _permissions;
                    operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                });
                var resultPromise = permissionsToModifyPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
        });
        describe('executing user is GUEST', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.GUEST]);
            });
            it('modifying TEAMS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not execute', function () {
                var permissionsToModify = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('modifying all permissions the user can add should execute', function () {
                var permissionsToModify;
                var operation;
                var permissionsToModifyPromise = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
                    .then(function (_permissions) {
                    permissionsToModify = _permissions;
                    operation = new TestModifyUserPermissionsOperationBase(userToModifyPermissionsOf.id, permissionsToModify, executingUser.id);
                });
                var resultPromise = permissionsToModifyPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
        });
    });
});
