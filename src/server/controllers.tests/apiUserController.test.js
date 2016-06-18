"use strict";
var userLoginManager_1 = require("../testUtils/userLoginManager");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
chai.use(chaiAsPromised);
var timeoutForLoadingServer = 100000;
describe('ApiUserController', function () {
    var expressServer;
    var server;
    var userDefinition;
    before(function () {
        this.timeout(timeoutForLoadingServer);
        expressServer = expressServer_1.ExpressServer.instance.initialize();
        server = supertest.agent(expressServer.expressApp);
    });
    beforeEach(function () {
        this.timeout(timeoutForLoadingServer);
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        this.timeout(timeoutForLoadingServer);
        userDefinition = {
            username: 'someUser',
            password: 'somePassword',
            email: 'a@gmail.com',
            firstName: 'first name',
            lastName: 'last name'
        };
        return userLoginManager_1.UserLoginManager.logoutUser(server);
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getExpectedUserDetails(user) {
        return {
            id: user.id,
            username: user.attributes.username,
            firstName: user.attributes.firstName,
            lastName: user.attributes.lastName
        };
    }
    describe('user not logged in', function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('getting user details should fail', function (done) {
            server.get('/apiuser')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
    });
    describe('user registered', function () {
        var user;
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
                .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
                .then(function (_user) {
                user = _user;
            });
        });
        it('getting user details should succeed', function (done) {
            var expectedUser = getExpectedUserDetails(user);
            server.get('/apiuser')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUser)
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('getting user details should fail', function (done) {
                server.get('/apiuser')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    });
    describe('user logged in', function () {
        var user;
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
                .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); })
                .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
                .then(function (_user) {
                user = _user;
            });
        });
        it('getting user details should succeed', function (done) {
            var expectedUser = getExpectedUserDetails(user);
            server.get('/apiuser')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUser)
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('getting user details should fail', function (done) {
                server.get('/apiuser')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=apiUserController.test.js.map