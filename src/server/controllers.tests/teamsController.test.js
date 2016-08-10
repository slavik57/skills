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
        describe('checking if team exists', function () {
            it('not existing team should fail', function (done) {
                server.get('/teams/notExistingTeam/exists')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('existing team should fail', function (done) {
                server.get('/teams/' + teams[0].attributes.name + '/exists')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
        it('deleting team should fail', function (done) {
            server.delete('/teams/' + teams[0].id)
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('updating team details should fail', function (done) {
            server.put('/teams/1')
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
            describe('checking if team exists', function () {
                it('not existing team', function (done) {
                    server.get('/teams/notExistingTeam/exists')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ teamExists: false })
                        .end(done);
                });
                it('existing team should return true', function (done) {
                    server.get('/teams/' + teams[0].attributes.name + '/exists')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ teamExists: true })
                        .end(done);
                });
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
            describe('delete team', function () {
                it('deleting team without sufficient permissions should fail', function (done) {
                    server.delete('/teams/' + teams[0].id)
                        .send({ name: 'some new name' })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('deleting not existing team should succeed', function (done) {
                        server.delete('/teams/' + 9996655)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('deleting existing team should succeed', function (done) {
                        server.delete('/teams/' + teams[0].id)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('deleting existing team should delete the team', function (done) {
                        var teamIdToDelete = teams[0].id;
                        server.delete('/teams/' + teamIdToDelete)
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeams()
                                .then(function (_teams) { return _.map(_teams, function (_) { return _.id; }); })
                                .then(function (_teamIds) {
                                chai_1.expect(_teamIds).not.to.contain(teamIdToDelete);
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
            describe('update team name', function () {
                var teamToUpdate;
                beforeEach(function () {
                    teamToUpdate = teams[0];
                });
                it('on invalid team name should fail', function (done) {
                    server.put('/teams/' + teamToUpdate.id)
                        .send({ name: '' })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.put('/teams/' + teamToUpdate.id)
                        .send({ name: '' })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.put('/teams/' + teamToUpdate.id)
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.put('/teams/' + teamToUpdate.id)
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty team name should fail', function (done) {
                        server.put('/teams/' + teamToUpdate.id)
                            .send({ name: '' })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with existing team name should fail', function (done) {
                        server.put('/teams/' + teamToUpdate.id)
                            .send({ name: teams[1].attributes.name })
                            .expect(statusCode_1.StatusCode.CONFLICT)
                            .end(done);
                    });
                    it('with new team name should succeed', function (done) {
                        server.put('/teams/' + teamToUpdate.id)
                            .send({ name: 'some new team name' })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with new team name should update the team', function (done) {
                        var newTeamName = 'some new team name';
                        server.put('/teams/' + teamToUpdate.id)
                            .send({ name: newTeamName })
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeam(teamToUpdate.id)
                                .then(function (_team) {
                                chai_1.expect(_team.attributes.name).to.be.equal(newTeamName);
                                done();
                            });
                        });
                    });
                    it('should return the team info', function (done) {
                        var newTeamName = 'some new team name';
                        server.put('/teams/' + teamToUpdate.id)
                            .send({ name: newTeamName })
                            .end(function (error, response) {
                            chai_1.expect(response.body).to.deep.equal({
                                id: teamToUpdate.id,
                                teamName: newTeamName
                            });
                            done();
                        });
                    });
                };
                describe('user is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is teams list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is team admin', function () {
                    beforeEach(function () {
                        var teamMemberInfo = {
                            team_id: teamToUpdate.id,
                            user_id: executingUser.id,
                            is_admin: true
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    sufficientPermissionsTests();
                });
            });
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