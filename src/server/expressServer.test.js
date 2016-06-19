"use strict";
var userDataHandler_1 = require("./dataHandlers/userDataHandler");
var loginUserOperation_1 = require("./operations/userOperations/loginUserOperation");
var globalPermission_1 = require("./models/enums/globalPermission");
var createUserOperation_1 = require("./operations/userOperations/createUserOperation");
var environmentCleaner_1 = require("./testUtils/environmentCleaner");
var expressServer_1 = require("./expressServer");
var chai = require('chai');
var chai_1 = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var testConfigurations_1 = require('../../testConfigurations');
chai.use(chaiAsPromised);
describe('ExpressServer', function () {
    var expressServer;
    var server;
    var adminUsername;
    var adminDefaultPassword;
    before(function (done) {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return expressServer_1.ExpressServer.instance.initialize()
            .then(function (_expressServer) {
            expressServer = _expressServer;
            server = supertest.agent(expressServer.expressApp);
            done();
        });
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        adminUsername = 'admin';
        adminDefaultPassword = 'admin';
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function verifyAdminUserInfo(userInfo, expectedUserInfo) {
        chai_1.expect(userInfo.username).to.be.equal(expectedUserInfo.username);
        chai_1.expect(userInfo.email).to.be.equal(expectedUserInfo.email);
        chai_1.expect(userInfo.firstName).to.be.equal(expectedUserInfo.firstName);
        chai_1.expect(userInfo.lastName).to.be.equal(expectedUserInfo.lastName);
    }
    function verifyAdminRights(user) {
        var expectedPermissions = [
            globalPermission_1.GlobalPermission.ADMIN
        ];
        return chai_1.expect(userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id)).to.eventually.fulfilled
            .then(function (_permissions) {
            chai_1.expect(_permissions).to.be.deep.equal(expectedPermissions);
        });
    }
    describe('initialize', function () {
        describe('admin user does not exist', function () {
            var defaultAdminInfo;
            beforeEach(function () {
                defaultAdminInfo = {
                    username: adminUsername,
                    password: adminDefaultPassword,
                    email: null,
                    firstName: adminUsername,
                    lastName: adminUsername
                };
            });
            it('should create the admin user with correct info', function () {
                var initializationPromise = expressServer.initialize();
                return chai_1.expect(initializationPromise).to.eventually.fulfilled
                    .then(function () { return new loginUserOperation_1.LoginUserOperation(adminUsername, adminDefaultPassword).execute(); })
                    .then(function (_user) {
                    verifyAdminUserInfo(_user.attributes, defaultAdminInfo);
                });
            });
            it('should create the admin user with correct user rights', function () {
                var initializationPromise = expressServer.initialize();
                return chai_1.expect(initializationPromise).to.eventually.fulfilled
                    .then(function () { return new loginUserOperation_1.LoginUserOperation(adminUsername, adminDefaultPassword).execute(); })
                    .then(function (_user) {
                    return verifyAdminRights(_user);
                });
            });
        });
        describe('admin user exists', function () {
            var adminRegistrationDefinition;
            beforeEach(function () {
                adminRegistrationDefinition = {
                    username: adminUsername,
                    password: adminDefaultPassword + 'not default password',
                    email: 'email@gmail.com',
                    firstName: 'first name',
                    lastName: 'last name'
                };
                var createUserOperation = new createUserOperation_1.CreateUserOperation(adminRegistrationDefinition.username, adminRegistrationDefinition.password, adminRegistrationDefinition.email, adminRegistrationDefinition.firstName, adminRegistrationDefinition.lastName);
                return createUserOperation.execute();
            });
            it('should not change the admin information', function () {
                var initializationPromise = expressServer.initialize();
                return chai_1.expect(initializationPromise).to.eventually.fulfilled
                    .then(function () { return new loginUserOperation_1.LoginUserOperation(adminUsername, adminRegistrationDefinition.password).execute(); })
                    .then(function (_user) {
                    verifyAdminUserInfo(_user.attributes, adminRegistrationDefinition);
                });
            });
        });
    });
});
//# sourceMappingURL=expressServer.test.js.map