"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var userLoginManager_1 = require("../testUtils/userLoginManager");
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
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
    var notAuthorizedTests = function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('getting teams details should fail', function (done) {
            server.get('/teams')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('adding team should fail', function (done) {
            server.post('/teams')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
    };
    function authorizdedTests(beforeEachFunc) {
        return function () {
            var executingUser;
            beforeEach(function () {
                return beforeEachFunc()
                    .then(function (_user) {
                    executingUser = _user;
                });
            });
            it('getting teams details should succeed', function (done) {
                var expectedUsers = getExpectedTeamsDetails(teams).sort(function (_1, _2) { return _1.id - _2.id; });
                server.get('/teams')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(expectedUsers)
                    .end(done);
            });
            describe('add team', function () {
                it('adding team without sufficient permissions should fail', function (done) {
                    server.post('/teams')
                        .send({ name: 'some new name' })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('adding team without body should fail', function (done) {
                        server.post('/teams')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('adding team with empty body should fail', function (done) {
                        server.post('/teams')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('adding team with empty team name should fail', function (done) {
                        server.post('/teams')
                            .send({ name: '' })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('adding team with existing team name should fail', function (done) {
                        server.post('/teams')
                            .send({ name: teams[0].attributes.name })
                            .expect(statusCode_1.StatusCode.CONFLICT)
                            .end(done);
                    });
                    it('adding new team should succeed', function (done) {
                        server.post('/teams')
                            .send({ name: 'some new team name' })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('adding new team should add the team', function (done) {
                        var newTeamName = 'some new team name';
                        server.post('/teams')
                            .send({ name: newTeamName })
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeams()
                                .then(function (_teams) { return _.find(_teams, function (_) { return _.attributes.name === newTeamName; }); })
                                .then(function (_team) {
                                chai_1.expect(_team).to.exist;
                                done();
                            });
                        });
                    });
                    it('adding new team should return the team info', function (done) {
                        var newTeamName = 'some new team name';
                        server.post('/teams')
                            .send({ name: newTeamName })
                            .end(function (error, response) {
                            return teamsDataHandler_1.TeamsDataHandler.getTeams()
                                .then(function (_teams) { return _.find(_teams, function (_) { return _.attributes.name === newTeamName; }); })
                                .then(function (_team) {
                                chai_1.expect(response.body).to.deep.equal({
                                    id: _team.id,
                                    teamName: newTeamName
                                });
                                done();
                            });
                        });
                    });
                };
                describe('User is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('User is teams list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
            });
            describe('logout', notAuthorizedTests);
        };
    }
    describe('user not logged in', notAuthorizedTests);
    describe('user registered', authorizdedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); });
    }));
    describe('user logged in', authorizdedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userLoginManager_1.UserLoginManager.logoutUser(server); })
            .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); })
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); });
    }));
});
//# sourceMappingURL=teamsController.test.js.map