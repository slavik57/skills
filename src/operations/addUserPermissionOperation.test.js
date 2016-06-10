"use strict";
var addUserPermissionOperation_1 = require("./addUserPermissionOperation");
var globalPermission_1 = require("../models/enums/globalPermission");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('AddUserPermissionOperation', function () {
    var userToAddPermissionsTo;
    var executingUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
        ]); }).then(function (_users) {
            executingUser = _users[0], userToAddPermissionsTo = _users[1];
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('getListOfGlobalPermissionsTheExecutingUserCanAddToUser', function () {
        it('executing user is ADMIN should return all permissions', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () {
                return addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id);
            });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
        });
        it('executing user is TEAMS_LIST_ADMIN should return correct permissions', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () {
                return addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id);
            });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
        });
        it('executing user is SKILLS_LIST_ADMIN should return correct permissions', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () {
                return addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id);
            });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
        });
        it('executing user is READER should return empty list', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.READER]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () {
                return addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id);
            });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal([]);
        });
        it('executing user is GUEST should return empty list', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.GUEST]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () {
                return addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id);
            });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal([]);
        });
    });
    describe('execute', function () {
        describe('executing user is ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
            });
            it('adding all permissions should add all', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
            it('adding all permissions the user can add should add them all', function () {
                var permissionsToAdd;
                var operation;
                var permissionsToAddPromise = addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id)
                    .then(function (_permissions) {
                    permissionsToAdd = _permissions;
                    operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                });
                var resultPromise = permissionsToAddPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
        });
        describe('executing user is TEAMS_LIST_ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
            });
            it('adding TEAMS_LIST_ADMIN permissions should succeed', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
            it('adding SKILLS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding all permissions the user can add should add them all', function () {
                var permissionsToAdd;
                var operation;
                var permissionsToAddPromise = addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id)
                    .then(function (_permissions) {
                    permissionsToAdd = _permissions;
                    operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                });
                var resultPromise = permissionsToAddPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
        });
        describe('executing user is SKILLS_LIST_ADMIN', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
            });
            it('adding SKILLS_LIST_ADMIN permissions should succeed', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
            it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding all permissions the user can add should add them all', function () {
                var permissionsToAdd;
                var operation;
                var permissionsToAddPromise = addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id)
                    .then(function (_permissions) {
                    permissionsToAdd = _permissions;
                    operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                });
                var resultPromise = permissionsToAddPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
        });
        describe('executing user is READER', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.READER]);
            });
            it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding all permissions the user can add should add them all', function () {
                var permissionsToAdd;
                var operation;
                var permissionsToAddPromise = addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id)
                    .then(function (_permissions) {
                    permissionsToAdd = _permissions;
                    operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                });
                var resultPromise = permissionsToAddPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
        });
        describe('executing user is GUEST', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.GUEST]);
            });
            it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal([]);
                });
            });
            it('adding all permissions the user can add should add them all', function () {
                var permissionsToAdd;
                var operation;
                var permissionsToAddPromise = addUserPermissionOperation_1.AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUser.id)
                    .then(function (_permissions) {
                    permissionsToAdd = _permissions;
                    operation = new addUserPermissionOperation_1.AddUserPermissionOperation(userToAddPermissionsTo.id, permissionsToAdd, executingUser.id);
                });
                var resultPromise = permissionsToAddPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id); })
                    .then(function (_actualPermissions) {
                    chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
                });
            });
        });
    });
});