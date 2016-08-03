"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modifyTeamOperationBase_1 = require("./modifyTeamOperationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var TestModifyTeamOperationBase = (function (_super) {
    __extends(TestModifyTeamOperationBase, _super);
    function TestModifyTeamOperationBase(executingUserId) {
        _super.call(this, executingUserId);
        this.wasExecuted = false;
    }
    TestModifyTeamOperationBase.prototype.doWork = function () {
        this.wasExecuted = true;
        return null;
    };
    return TestModifyTeamOperationBase;
}(modifyTeamOperationBase_1.ModifyTeamOperationBase));
describe('ModifyUserPermissionsOperationBase', function () {
    var executingUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
        ]); }).then(function (_users) {
            executingUser = _users[0];
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
            it('should execute', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('can execute should succeed', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
        });
        describe('executing user is TEAMS_LIST_ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
            });
            it('should succeed', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('can execute should succeed', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
        });
        describe('executing user is SKILLS_LIST_ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
            });
            it('should fail and not execute', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('can execute should reject', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
        describe('executing user is READER', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.READER]);
            });
            it('should fail and not execute', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('can execute should reject', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
        describe('executing user is GUEST', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.GUEST]);
            });
            it('should fail and not execute', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('can execute should reject', function () {
                var operation = new TestModifyTeamOperationBase(executingUser.id);
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
    });
});
//# sourceMappingURL=modifyTeamOperationBase.test.js.map