"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var globalPermission_1 = require("../../models/enums/globalPermission");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var authenticatedOperationBase_1 = require('./authenticatedOperationBase');
chai.use(chaiAsPromised);
var TestAuthenticatedOperation = (function (_super) {
    __extends(TestAuthenticatedOperation, _super);
    function TestAuthenticatedOperation(userId) {
        _super.call(this, userId);
        this.wasExecuted = false;
        this.operationPermissionsToReturn = [];
    }
    Object.defineProperty(TestAuthenticatedOperation.prototype, "actualUserId", {
        get: function () { return this.executingUserId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestAuthenticatedOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return this.operationPermissionsToReturn;
        },
        enumerable: true,
        configurable: true
    });
    TestAuthenticatedOperation.prototype.doWork = function () {
        this.wasExecuted = true;
        if (this.executeOperationErrorToThrow) {
            throw this.executeOperationErrorToThrow;
        }
        return this.executeOperationResult;
    };
    return TestAuthenticatedOperation;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
describe('AuthenticatedOperationBase', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('new', function () {
        it('should initialize properties correctly', function () {
            var userId = 123456;
            var operation = new TestAuthenticatedOperation(userId);
            chai_1.expect(operation.actualUserId).to.be.equal(userId);
        });
    });
    describe('execute', function () {
        var user;
        beforeEach(function () {
            var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
                .then(function (_user) {
                user = _user;
            });
            return userCreationPromise;
        });
        it('executing with not existing user id should fail', function () {
            var userId = 12345;
            var operation = new TestAuthenticatedOperation(userId);
            var executionPromise = operation.execute();
            return chai_1.expect(executionPromise).to.eventually.rejected;
        });
        it('executing with not existing user id should not execute', function () {
            var userId = 12345;
            var operation = new TestAuthenticatedOperation(userId);
            var executionPromise = operation.execute();
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function () {
                chai_1.expect(operation.wasExecuted).to.be.false;
            });
        });
        it('executing with existing user id that has no global permissions should fail', function () {
            var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1));
            var executionPromise = userCreationPromise.then(function (_user) {
                return new TestAuthenticatedOperation(_user.id).execute();
            });
            return chai_1.expect(executionPromise).to.eventually.rejected;
        });
        it('executing with existing user id that has no global permissions should not execute the operation', function () {
            var operation = new TestAuthenticatedOperation(user.id);
            var executionPromise = operation.execute();
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function () {
                chai_1.expect(operation.wasExecuted).to.be.false;
            });
        });
        it('executing with existing user id that has admin permissions should execute', function () {
            var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var operation = new TestAuthenticatedOperation(user.id);
            var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.fulfilled
                .then(function () {
                chai_1.expect(operation.wasExecuted).to.be.true;
            });
        });
        it('executing with existing user id that has insufficient permissions should fail and not execute', function () {
            var uerPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.GUEST
            ];
            var createPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
            var operation = new TestAuthenticatedOperation(user.id);
            operation.operationPermissionsToReturn =
                [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
            var executionPromise = createPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function () {
                chai_1.expect(operation.wasExecuted).to.be.false;
            });
        });
        it('executing with existing user id that has sufficient permissions should succeed and execute', function () {
            var uerPermissions = [
                globalPermission_1.GlobalPermission.GUEST
            ];
            var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
            var operation = new TestAuthenticatedOperation(user.id);
            operation.operationPermissionsToReturn =
                [
                    globalPermission_1.GlobalPermission.GUEST,
                    globalPermission_1.GlobalPermission.READER
                ];
            var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.fulfilled
                .then(function () {
                chai_1.expect(operation.wasExecuted).to.be.true;
            });
        });
        it('executing with existing user id that has admin permissions and operation returning resolving promise should execute and resolve the correct result', function () {
            var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var operation = new TestAuthenticatedOperation(user.id);
            var expectedResult = {};
            operation.executeOperationResult = Promise.resolve(expectedResult);
            var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.fulfilled
                .then(function (_actualResult) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(_actualResult).to.be.equal(expectedResult);
            });
        });
        it('executing with existing user id that has admin permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
            var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var operation = new TestAuthenticatedOperation(user.id);
            var expectedError = {};
            operation.executeOperationResult = Promise.reject(expectedError);
            var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function (actualError) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(actualError).to.be.equal(expectedError);
            });
        });
        it('executing with existing user id that has sufficient permissions and operation returning resolving promise should execute and resolve the correct result', function () {
            var uerPermissions = [
                globalPermission_1.GlobalPermission.GUEST
            ];
            var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
            var operation = new TestAuthenticatedOperation(user.id);
            operation.operationPermissionsToReturn =
                [
                    globalPermission_1.GlobalPermission.GUEST,
                    globalPermission_1.GlobalPermission.READER
                ];
            var expectedResult = {};
            operation.executeOperationResult = Promise.resolve(expectedResult);
            var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.fulfilled
                .then(function (_actualResult) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(_actualResult).to.be.equal(expectedResult);
            });
        });
        it('executing with existing user id that has sufficient permissions and operation returning rejecting promise should execite and reject with the correct error', function () {
            var uerPermissions = [
                globalPermission_1.GlobalPermission.GUEST
            ];
            var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
            var operation = new TestAuthenticatedOperation(user.id);
            operation.operationPermissionsToReturn =
                [
                    globalPermission_1.GlobalPermission.GUEST,
                    globalPermission_1.GlobalPermission.READER
                ];
            var expectedError = {};
            operation.executeOperationResult = Promise.reject(expectedError);
            var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function (_actualError) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(_actualError).to.be.equal(expectedError);
            });
        });
        it('executing with existing user id that has admin permissions and operation returning result should execute and resolve the correct result', function () {
            var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var operation = new TestAuthenticatedOperation(user.id);
            var expectedResult = {};
            operation.executeOperationResult = expectedResult;
            var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.fulfilled
                .then(function (_actualResult) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(_actualResult).to.be.equal(expectedResult);
            });
        });
        it('executing with existing user id that has admin permissions and operation throwing error promise should execute and reject with the correct error', function () {
            var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var operation = new TestAuthenticatedOperation(user.id);
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;
            var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function (actualError) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(actualError).to.be.equal(expectedError);
            });
        });
        it('executing with existing user id that has sufficient permissions and operation returning result should execute and resolve the correct result', function () {
            var uerPermissions = [
                globalPermission_1.GlobalPermission.GUEST
            ];
            var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
            var operation = new TestAuthenticatedOperation(user.id);
            operation.operationPermissionsToReturn =
                [
                    globalPermission_1.GlobalPermission.GUEST,
                    globalPermission_1.GlobalPermission.READER
                ];
            var expectedResult = {};
            operation.executeOperationResult = expectedResult;
            var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.fulfilled
                .then(function (_actualResult) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(_actualResult).to.be.equal(expectedResult);
            });
        });
        it('executing with existing user id that has sufficient permissions and operation throwing error promise should execite and reject with the correct error', function () {
            var uerPermissions = [
                globalPermission_1.GlobalPermission.GUEST
            ];
            var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
            var operation = new TestAuthenticatedOperation(user.id);
            operation.operationPermissionsToReturn =
                [
                    globalPermission_1.GlobalPermission.GUEST,
                    globalPermission_1.GlobalPermission.READER
                ];
            var expectedError = {};
            operation.executeOperationErrorToThrow = expectedError;
            var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executionPromise).to.eventually.rejected
                .then(function (_actualError) {
                chai_1.expect(operation.wasExecuted).to.be.true;
                chai_1.expect(_actualError).to.be.equal(expectedError);
            });
        });
    });
});
