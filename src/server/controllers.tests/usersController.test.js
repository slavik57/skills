"use strict";
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var userLoginManager_1 = require("../testUtils/userLoginManager");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var chai_1 = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
var testConfigurations_1 = require('../../../testConfigurations');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('usersController', function () {
    var expressServer;
    var server;
    var userDefinition;
    var users;
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
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return environmentDirtifier_1.EnvironmentDirtifier.createUsers(5)
            .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
            .then(function (_users) {
            users = _users;
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getExpectedUsersDetails(users) {
        return _.map(users, function (_user) {
            return {
                id: _user.id,
                username: _user.attributes.username
            };
        });
    }
    describe('user not logged in', function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('getting users details should fail', function (done) {
            server.get('/users')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('getting filtered users details by partial username should fail', function (done) {
            server.get('/users/filtered/1')
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
                users.push(user);
            });
        });
        it('getting users details should succeed', function (done) {
            var expectedUsers = getExpectedUsersDetails(users);
            server.get('/users')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUsers)
                .end(done);
        });
        it('getting filtered users details by partial username should return one user', function (done) {
            var usersWith1 = _.filter(users, function (_) { return _.attributes.username.indexOf('1') >= 0; });
            var expectedUsers = getExpectedUsersDetails(usersWith1);
            chai_1.expect(expectedUsers.length > 0).to.be.true;
            server.get('/users/filtered/1')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUsers)
                .end(done);
        });
        it('getting filtered users details by partial username should return all users', function (done) {
            var usersWithUsername = _.filter(users, function (_) { return _.attributes.username.indexOf('username') >= 0; });
            var expectedUsers = getExpectedUsersDetails(usersWithUsername);
            chai_1.expect(expectedUsers.length > 0).to.be.true;
            server.get('/users/filtered/username')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUsers)
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('getting users details should fail', function (done) {
                server.get('/users')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('getting filtered users details by partial username should fail', function (done) {
                server.get('/users/filtered/1')
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
                users.push(user);
            });
        });
        it('getting user details should succeed', function (done) {
            var expectedUsers = getExpectedUsersDetails(users);
            server.get('/users')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUsers)
                .end(done);
        });
        it('getting filtered users details by partial username should return once user', function (done) {
            var usersWith1 = _.filter(users, function (_) { return _.attributes.username.indexOf('1') >= 0; });
            var expectedUsers = getExpectedUsersDetails(usersWith1);
            chai_1.expect(expectedUsers.length > 0).to.be.true;
            server.get('/users/filtered/1')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUsers)
                .end(done);
        });
        it('getting filtered users details by partial username should return all users', function (done) {
            var usersWithUsername = _.filter(users, function (_) { return _.attributes.username.indexOf('username') >= 0; });
            var expectedUsers = getExpectedUsersDetails(usersWithUsername);
            chai_1.expect(expectedUsers.length > 0).to.be.true;
            server.get('/users/filtered/username')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUsers)
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('getting users details should fail', function (done) {
                server.get('/users')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('getting filtered users details by partial username should fail', function (done) {
                server.get('/users/filtered/1')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=usersController.test.js.map