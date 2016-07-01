"use strict";
var userLoginManager_1 = require("../testUtils/userLoginManager");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
var testConfigurations_1 = require('../../../testConfigurations');
chai.use(chaiAsPromised);
describe('userController', function () {
    var expressServer;
    var server;
    var userDefinition;
    before(function (done) {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        expressServer_1.ExpressServer.instance.initialize()
            .then(function (_expressServer) {
            expressServer = _expressServer;
            server = supertest.agent(expressServer.expressApp);
            done();
        });
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
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
            server.get('/user')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('checking if user exists should fail', function (done) {
            server.get('/user/someuser/exists')
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
            server.get('/user')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUser)
                .end(done);
        });
        it('checking if not existing user exists should return false', function (done) {
            server.get('/user/notExistingUser/exists')
                .expect(statusCode_1.StatusCode.OK)
                .expect({ userExists: false })
                .end(done);
        });
        it('checking if existing user exists should return true', function (done) {
            server.get('/user/' + userDefinition.username + '/exists')
                .expect(statusCode_1.StatusCode.OK)
                .expect({ userExists: true })
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('getting user details should fail', function (done) {
                server.get('/user')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('checking if user exists should fail', function (done) {
                server.get('/user/someuser/exists')
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
            server.get('/user')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUser)
                .end(done);
        });
        it('checking if not existing user exists should return false', function (done) {
            server.get('/user/notExistingUser/exists')
                .expect(statusCode_1.StatusCode.OK)
                .expect({ userExists: false })
                .end(done);
        });
        it('checking if existing user exists should return true', function (done) {
            server.get('/user/' + userDefinition.username + '/exists')
                .expect(statusCode_1.StatusCode.OK)
                .expect({ userExists: true })
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('getting user details should fail', function (done) {
                server.get('/user')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('checking if user exists should fail', function (done) {
                server.get('/user/someuser/exists')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=userController.test.js.map