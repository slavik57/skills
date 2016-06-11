"use strict";
var getAllowedUserPermissionsToModifyOperation_1 = require("./getAllowedUserPermissionsToModifyOperation");
var globalPermission_1 = require("../../models/enums/globalPermission");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('GetAllowedUserPermissionsToModifyOperation', function () {
    var user;
    var operation;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)); })
            .then(function (_user) {
            user = _user;
        }).then(function () {
            operation = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(user.id);
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        it('executing user is ADMIN should return all permissions', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () { return operation.execute(); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
        });
        it('executing user is TEAMS_LIST_ADMIN should return correct permissions', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () { return operation.execute(); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
        });
        it('executing user is SKILLS_LIST_ADMIN should return correct permissions', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () { return operation.execute(); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
        });
        it('executing user is READER should return empty list', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.READER]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () { return operation.execute(); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal([]);
        });
        it('executing user is GUEST should return empty list', function () {
            var addPermissionsToExecutingUserPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.GUEST]);
            var resultPromise = addPermissionsToExecutingUserPromise.then(function () { return operation.execute(); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            return chai_1.expect(resultPromise).to.eventually.deep.equal([]);
        });
    });
});
