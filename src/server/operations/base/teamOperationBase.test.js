"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var globalPermission_1 = require("../../models/enums/globalPermission");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var teamOperationBase_1 = require('./teamOperationBase');
chai.use(chaiAsPromised);
var TestTeamOperationBase = (function (_super) {
    __extends(TestTeamOperationBase, _super);
    function TestTeamOperationBase(teamId, userId) {
        _super.call(this, teamId, userId);
        this.wasExecuted = false;
        this.operationPermissionsToReturn = [];
        this.isRegularTeamMemberAlowedToExecuteToReturn = false;
    }
    Object.defineProperty(TestTeamOperationBase.prototype, "actualUserId", {
        get: function () { return this.executingUserId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestTeamOperationBase.prototype, "actualTeamId", {
        get: function () { return this.teamId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestTeamOperationBase.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return this.operationPermissionsToReturn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestTeamOperationBase.prototype, "isRegularTeamMemberAlowedToExecute", {
        get: function () { return this.isRegularTeamMemberAlowedToExecuteToReturn; },
        enumerable: true,
        configurable: true
    });
    TestTeamOperationBase.prototype.doWork = function () {
        this.wasExecuted = true;
        if (this.executeOperationErrorToThrow) {
            throw this.executeOperationErrorToThrow;
        }
        return this.executeOperationResultToReturn;
    };
    return TestTeamOperationBase;
}(teamOperationBase_1.TeamOperationBase));
describe('TeamOperationBase', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('new', function () {
        it('should initialize properties correctly', function () {
            var userId = 123456;
            var teamId = 54321;
            var operation = new TestTeamOperationBase(teamId, userId);
            chai_1.expect(operation.actualUserId).to.be.equal(userId);
            chai_1.expect(operation.actualTeamId).to.be.equal(teamId);
        });
    });
    describe('execute', function () {
        var team;
        beforeEach(function () {
            var user;
            var teamCreationPromise = environmentCleaner_1.EnvironmentCleaner.clearTables()
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1); })
                .then(function (_users) {
                user = _users[0];
            })
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1'), user.id); })
                .then(function (_team) {
                team = _team;
            });
            return teamCreationPromise;
        });
        describe('in the team', function () {
            var user;
            var operation;
            beforeEach(function () {
                var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
                    .then(function (_user) {
                    user = _user;
                    operation = new TestTeamOperationBase(team.id, user.id);
                });
                return userCreationPromise.then(function () {
                    var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, user);
                    return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                });
            });
            describe('not team admin', function () {
                beforeEach(function () {
                    return teamsDataHandler_1.TeamsDataHandler.setAdminRights(team.id, user.id, false);
                });
                describe('regular team member cannot execute', function () {
                    beforeEach(function () {
                        operation.isRegularTeamMemberAlowedToExecuteToReturn = false;
                    });
                    it('has no global permissions should fail and not execute', function () {
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.false;
                        });
                    });
                    it('has global admin permissions should execute', function () {
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has global admin permissions and operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions should fail and not execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.false;
                        });
                    });
                    it('has sufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning result should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                });
                describe('regular team member can execute', function () {
                    beforeEach(function () {
                        operation.isRegularTeamMemberAlowedToExecuteToReturn = true;
                    });
                    it('has no global permissions should succeed and execute', function () {
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions should execute', function () {
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has global admin permissions and operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has sufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions and operation returning resolving promise should execute and return correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has insufficient global permissions and operation returning rejecting promise should fail and return correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions and operation returning result should execute and return correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has insufficient global permissions and operation throwing error should fail and return correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning result should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                });
            });
            describe('team admin', function () {
                beforeEach(function () {
                    return teamsDataHandler_1.TeamsDataHandler.setAdminRights(team.id, user.id, true);
                });
                describe('regular team member cannot execute', function () {
                    beforeEach(function () {
                        operation.isRegularTeamMemberAlowedToExecuteToReturn = false;
                    });
                    it('has no global permissions should succeed and execute', function () {
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions should execute', function () {
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has global admin permissions and operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has insufficient global permissions and operation returning resolving promise should execute and return correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has insufficient global permissions and operation returning rejecting promise should fail and return correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions and operation returning result should execute and return correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var userPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, userPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has insufficient global permissions and operation throwing error should fail and return correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var userPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, userPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning result should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                });
                describe('regular team member can execute', function () {
                    beforeEach(function () {
                        operation.isRegularTeamMemberAlowedToExecuteToReturn = true;
                    });
                    it('has no global permissions should succeed and execute', function () {
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions should execute', function () {
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has global admin permissions and operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has global admin permissions and operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                        var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('has insufficient global permissions and operation returning resolving promise should execute and return correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has insufficient global permissions and operation returning rejecting promise should fail and return correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has insufficient global permissions and operation returning result should execute and return correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has insufficient global permissions and operation throwing error should fail and return correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions should succeed and execute', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function () {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                        });
                    });
                    it('operation returning resolving promise should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('operation returning rejecting promise should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError).to.be.equal(expectedError);
                        });
                    });
                    it('operation returning result should execute and resolve the correct result', function () {
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('operation throwing error should execute and reject with the correct error', function () {
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var executionPromise = operation.execute();
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationResultToReturn = Promise.reject(expectedError);
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError).to.be.equal(expectedError);
                        });
                    });
                    it('has sufficient global permissions and operation returning result should execute and resolve the correct result', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedResult = {};
                        operation.executeOperationResultToReturn = expectedResult;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.fulfilled
                            .then(function (_actualResult) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualResult).to.be.equal(expectedResult);
                        });
                    });
                    it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', function () {
                        operation.operationPermissionsToReturn =
                            [
                                globalPermission_1.GlobalPermission.GUEST,
                                globalPermission_1.GlobalPermission.READER
                            ];
                        var expectedError = {};
                        operation.executeOperationErrorToThrow = expectedError;
                        var uerPermissions = [
                            globalPermission_1.GlobalPermission.GUEST
                        ];
                        var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                        var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                        return chai_1.expect(executionPromise).to.eventually.rejected
                            .then(function (_actualError) {
                            chai_1.expect(operation.wasExecuted).to.be.true;
                            chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                        });
                    });
                });
            });
        });
        describe('not in the team', function () {
            var user;
            var operation;
            beforeEach(function () {
                var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
                    .then(function (_user) {
                    user = _user;
                    operation = new TestTeamOperationBase(team.id, user.id);
                });
                return userCreationPromise;
            });
            it('has no global permissions should fail', function () {
                var executionPromise = new TestTeamOperationBase(team.id, user.id).execute();
                return chai_1.expect(executionPromise).to.eventually.rejected;
            });
            it('has global admin permissions should execute', function () {
                var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('has global admin permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                var expectedResult = {};
                operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.fulfilled
                    .then(function (_actualResult) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualResult).to.be.equal(expectedResult);
                });
            });
            it('has global admin permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                var expectedError = {};
                operation.executeOperationResultToReturn = Promise.reject(expectedError);
                var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function (actualError) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(actualError).to.be.equal(expectedError);
                });
            });
            it('has global admin permissions and operation returning result should execute and resolve the correct result', function () {
                var expectedResult = {};
                operation.executeOperationResultToReturn = expectedResult;
                var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.fulfilled
                    .then(function (_actualResult) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualResult).to.be.equal(expectedResult);
                });
            });
            it('has global admin permissions and operation throwing error should execute and reject with the correct error', function () {
                var expectedError = {};
                operation.executeOperationErrorToThrow = expectedError;
                var createAdminPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                var executionPromise = createAdminPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function (actualError) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(actualError.innerError).to.be.equal(expectedError);
                });
            });
            it('has insufficient global permissions should fail and not execute', function () {
                operation.operationPermissionsToReturn =
                    [
                        globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                        globalPermission_1.GlobalPermission.READER
                    ];
                var uerPermissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var addGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                var executionPromise = addGlobalPermissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('has sufficient global permissions should succeed and execute', function () {
                operation.operationPermissionsToReturn =
                    [
                        globalPermission_1.GlobalPermission.GUEST,
                        globalPermission_1.GlobalPermission.READER
                    ];
                var uerPermissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('has sufficient global permissions and operation returning resolving promise should execute and resolve the correct result', function () {
                operation.operationPermissionsToReturn =
                    [
                        globalPermission_1.GlobalPermission.GUEST,
                        globalPermission_1.GlobalPermission.READER
                    ];
                var expectedResult = {};
                operation.executeOperationResultToReturn = Promise.resolve(expectedResult);
                var uerPermissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.fulfilled
                    .then(function (_actualResult) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualResult).to.be.equal(expectedResult);
                });
            });
            it('has sufficient global permissions and operation returning rejecting promise should execute and reject with the correct error', function () {
                operation.operationPermissionsToReturn =
                    [
                        globalPermission_1.GlobalPermission.GUEST,
                        globalPermission_1.GlobalPermission.READER
                    ];
                var expectedError = {};
                operation.executeOperationResultToReturn = Promise.reject(expectedError);
                var uerPermissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function (_actualError) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualError).to.be.equal(expectedError);
                });
            });
            it('has sufficient global permissions and operation returning result should execute and resolve the correct result', function () {
                operation.operationPermissionsToReturn =
                    [
                        globalPermission_1.GlobalPermission.GUEST,
                        globalPermission_1.GlobalPermission.READER
                    ];
                var expectedResult = {};
                operation.executeOperationResultToReturn = expectedResult;
                var uerPermissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.fulfilled
                    .then(function (_actualResult) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualResult).to.be.equal(expectedResult);
                });
            });
            it('has sufficient global permissions and operation throwing error should execute and reject with the correct error', function () {
                operation.operationPermissionsToReturn =
                    [
                        globalPermission_1.GlobalPermission.GUEST,
                        globalPermission_1.GlobalPermission.READER
                    ];
                var expectedError = {};
                operation.executeOperationErrorToThrow = expectedError;
                var uerPermissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var createUserPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, uerPermissions);
                var executionPromise = createUserPermissions.then(function () { return operation.execute(); });
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function (_actualError) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualError.innerError).to.be.equal(expectedError);
                });
            });
        });
        describe('not existing user or team', function () {
            var notExistingUserId = 123456;
            var notExistingTeamId = 654321;
            it('not existing user id should not execute', function () {
                var operation = new TestTeamOperationBase(team.id, notExistingUserId);
                var executionPromise = operation.execute();
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
            it('not existing team id should not execute', function () {
                var userCreationPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3));
                var operation;
                var executionPromise = userCreationPromise.then(function (_user) {
                    operation = new TestTeamOperationBase(notExistingTeamId, _user.id);
                    return operation.execute();
                });
                return chai_1.expect(executionPromise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
        });
    });
});
//# sourceMappingURL=teamOperationBase.test.js.map