"use strict";
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getUserPermissionsOperation_1 = require('./getUserPermissionsOperation');
chai.use(chaiAsPromised);
describe('GetUserPermissionsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var user;
        var permissions;
        var operation;
        beforeEach(function () {
            permissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUserWithPermissions(userInfo, permissions)
                .then(function (_user) {
                user = _user;
            });
            return createUserPromise.then(function () {
                operation = new getUserPermissionsOperation_1.GetUserPermissionsOperation(user.id);
            });
        });
        it('should return correct permissions', function () {
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualPermissions) {
                chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(permissions.sort());
            });
        });
    });
});
