"use strict";
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var userLoginManager_1 = require("../testUtils/userLoginManager");
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
var testConfigurations_1 = require('../../../testConfigurations');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('teamsController', function () {
    var expressServer;
    var server;
    var userDefinition;
    var teamCreatorUser;
    var teams;
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
        return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
            .then(function (_users) {
            teamCreatorUser = _users[0];
        });
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return environmentDirtifier_1.EnvironmentDirtifier.createTeams(5, teamCreatorUser.id)
            .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeams(); })
            .then(function (_teams) {
            teams = _teams;
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getExpectedTeamsDetails(teams) {
        return _.map(teams, function (_team) {
            return {
                id: _team.id,
                teamName: _team.attributes.name
            };
        });
    }
    function notAuthorizedTests(beforeEachFunc) {
        return function () {
            beforeEach(beforeEachFunc);
            it('getting teams details should fail', function (done) {
                server.get('/teams')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        };
    }
    function authorizdedTests(beforeEachFunc) {
        return function () {
            beforeEach(beforeEachFunc);
            it('getting teams details should succeed', function (done) {
                var expectedUsers = getExpectedTeamsDetails(teams).sort(function (_1, _2) { return _1.id - _2.id; });
                server.get('/teams')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(expectedUsers)
                    .end(done);
            });
            describe('logout', function () {
                beforeEach(function () {
                    return userLoginManager_1.UserLoginManager.logoutUser(server);
                });
                it('getting teams details should fail', function (done) {
                    server.get('/teams')
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
            });
        };
    }
    describe('user not logged in', notAuthorizedTests(function () {
        return userLoginManager_1.UserLoginManager.logoutUser(server);
    }));
    describe('user registered', authorizdedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition);
    }));
    describe('user logged in', authorizdedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userLoginManager_1.UserLoginManager.logoutUser(server); })
            .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); });
    }));
});
//# sourceMappingURL=teamsController.test.js.map