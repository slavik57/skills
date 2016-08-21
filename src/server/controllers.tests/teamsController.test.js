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
    function getExpectedTeamsMembers(team, teamMembers, teamMemberInfos) {
        var result = [];
        for (var i = 0; i < teamMembers.length; i++) {
            result.push({
                id: teamMembers[i].id,
                username: teamMembers[i].attributes.username,
                isAdmin: teamMemberInfos[i].is_admin
            });
        }
        return result;
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
        it('getting team members should fail', function (done) {
            server.get('/teams/' + teams[0].id + '/members')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('adding team member should fail', function (done) {
            server.post('/teams/1/members')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('deleting team should fail', function (done) {
            server.delete('/teams/1/members')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('updating team member rights should fail', function (done) {
            server.patch('/teams/1/members/2/admin')
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
                        .send({ name: 'new name' })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
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
            describe('getting team members', function () {
                var teamOfTeamMembers;
                var teamMembers;
                var teamMemberInfos;
                beforeEach(function () {
                    teamOfTeamMembers = teams[0];
                    return environmentDirtifier_1.EnvironmentDirtifier.createUsers(3, '_getTeamMember')
                        .then(function (_users) {
                        teamMembers = _users;
                        teamMemberInfos = [
                            { team_id: teamOfTeamMembers.id, user_id: teamMembers[0].id, is_admin: true },
                            { team_id: teamOfTeamMembers.id, user_id: teamMembers[1].id, is_admin: false },
                            { team_id: teamOfTeamMembers.id, user_id: teamMembers[2].id, is_admin: true }
                        ];
                    })
                        .then(function () { return Promise.all([
                        teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfos[0]),
                        teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfos[1]),
                        teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfos[2])
                    ]); });
                });
                it('should return correct team members', function (done) {
                    var expectedTeamMembers = getExpectedTeamsMembers(teamOfTeamMembers, teamMembers, teamMemberInfos).sort(function (_1, _2) { return _1.id - _2.id; });
                    server.get('/teams/' + teamOfTeamMembers.id + '/members')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedTeamMembers)
                        .end(done);
                });
            });
            describe('add team member', function () {
                var teamToAddUserTo;
                var userToAdd;
                beforeEach(function () {
                    teamToAddUserTo = teams[0];
                    return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1, 'team_member_to_add')
                        .then(function (_users) {
                        userToAdd = _users[0];
                    });
                });
                it('on invalid username should fail', function (done) {
                    server.post('/teams/' + teamToAddUserTo.id + '/members')
                        .send({ username: '' })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.post('/teams/' + teamToAddUserTo.id + '/members')
                        .send({ username: userToAdd.attributes.username })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty username should fail', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: '' })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with not existing username should fail', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: 'not existing username' })
                            .expect(statusCode_1.StatusCode.NOT_FOUND)
                            .end(done);
                    });
                    it('with exiting username should succeed', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: userToAdd.attributes.username })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with existing username should add the user to the team', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: userToAdd.attributes.username })
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToAddUserTo.id)
                                .then(function (_teamMembers) { return _.find(_teamMembers, function (_member) { return _member.user.id === userToAdd.id; }); })
                                .then(function (_teamMember) {
                                chai_1.expect(_teamMember.user.attributes.username).to.be.equal(userToAdd.attributes.username);
                                done();
                            });
                        });
                    });
                    it('should return the user info', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: userToAdd.attributes.username })
                            .end(function (error, response) {
                            chai_1.expect(response.body).to.deep.equal({
                                id: userToAdd.id,
                                username: userToAdd.attributes.username,
                                isAdmin: false
                            });
                            done();
                        });
                    });
                    it('with user that is already in the team should fail', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: userToAdd.attributes.username })
                            .end(function () {
                            server.post('/teams/' + teamToAddUserTo.id + '/members')
                                .send({ username: userToAdd.attributes.username })
                                .expect(statusCode_1.StatusCode.CONFLICT)
                                .end(done);
                        });
                    });
                    it('with user that is already in the team should fail with correct error', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: userToAdd.attributes.username })
                            .end(function () {
                            server.post('/teams/' + teamToAddUserTo.id + '/members')
                                .send({ username: userToAdd.attributes.username })
                                .expect({ error: 'The user is already in the team' })
                                .end(done);
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
                            team_id: teamToAddUserTo.id,
                            user_id: executingUser.id,
                            is_admin: true
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is regular team member', function () {
                    beforeEach(function () {
                        var teamMemberInfo = {
                            team_id: teamToAddUserTo.id,
                            user_id: executingUser.id,
                            is_admin: false
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    it('should fail', function (done) {
                        server.post('/teams/' + teamToAddUserTo.id + '/members')
                            .send({ username: userToAdd.attributes.username })
                            .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                            .end(done);
                    });
                });
            });
            describe('remove team member', function () {
                var teamToRemoveUserFrom;
                var userToRemove;
                beforeEach(function () {
                    teamToRemoveUserFrom = teams[0];
                    return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1, 'team_member_to_add')
                        .then(function (_users) {
                        userToRemove = _users[0];
                    })
                        .then(function () {
                        var teamMemberInfo = {
                            team_id: teamToRemoveUserFrom.id,
                            user_id: userToRemove.id,
                            is_admin: false
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                });
                it('on invalid userId should fail', function (done) {
                    server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                        .send({ userId: null })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                        .send({ userId: userToRemove.id })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with null userId should fail', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({ userId: null })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with not existing user id should succeed', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({ userId: 98765 })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with exiting user id should succeed', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({ userId: userToRemove.id })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with existing username should remove the user from the team', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({ userId: userToRemove.id })
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToRemoveUserFrom.id)
                                .then(function (_teamMembers) { return _.find(_teamMembers, function (_member) { return _member.user.id === userToRemove.id; }); })
                                .then(function (_teamMember) {
                                chai_1.expect(_teamMember).to.not.exist;
                                done();
                            });
                        });
                    });
                    it('with user that is not in the team should succeed', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({ userId: userToRemove.id })
                            .end(function () {
                            server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                                .send({ userId: userToRemove.id })
                                .expect(statusCode_1.StatusCode.OK)
                                .end(done);
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
                            team_id: teamToRemoveUserFrom.id,
                            user_id: executingUser.id,
                            is_admin: true
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is regular team member', function () {
                    beforeEach(function () {
                        var teamMemberInfo = {
                            team_id: teamToRemoveUserFrom.id,
                            user_id: executingUser.id,
                            is_admin: false
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    it('should fail', function (done) {
                        server.delete('/teams/' + teamToRemoveUserFrom.id + '/members')
                            .send({ userId: userToRemove.id })
                            .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                            .end(done);
                    });
                });
            });
            describe('update team member admin rights', function () {
                var teamToUpdateTheUserIn;
                var userToUpdate;
                var originalIsAdmin;
                beforeEach(function () {
                    teamToUpdateTheUserIn = teams[0];
                    originalIsAdmin = false;
                    return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1, 'team_member_to_add')
                        .then(function (_users) {
                        userToUpdate = _users[0];
                    })
                        .then(function () {
                        var teamMemberInfo = {
                            team_id: teamToUpdateTheUserIn.id,
                            user_id: userToUpdate.id,
                            is_admin: originalIsAdmin
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                });
                it('on invalid isAdmin should fail', function (done) {
                    server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                        .send({ isAdmin: null })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                        .send({ isAdmin: !originalIsAdmin })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                it('without sufficient permissions should not update the user admin rights', function (done) {
                    server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                        .send({ isAdmin: !originalIsAdmin })
                        .end(function () {
                        teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToUpdateTheUserIn.id)
                            .then(function (_teamMembers) { return _.find(_teamMembers, function (_member) { return _member.user.id === userToUpdate.id; }); })
                            .then(function (_teamMember) {
                            chai_1.expect(_teamMember.isAdmin).to.be.equal(originalIsAdmin);
                            done();
                        });
                    });
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with null isAdmin should fail', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .send({ isAdmin: null })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with null user id should fail', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + null + '/admin')
                            .send({ isAdmin: !originalIsAdmin })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with not existing user id should fail', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + 98765 + '/admin')
                            .send({ isAdmin: !originalIsAdmin })
                            .expect(statusCode_1.StatusCode.NOT_FOUND)
                            .end(done);
                    });
                    it('with exiting user id should succeed', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .send({ isAdmin: !originalIsAdmin })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with existing username should update the user admin rights', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .send({ isAdmin: !originalIsAdmin })
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToUpdateTheUserIn.id)
                                .then(function (_teamMembers) { return _.find(_teamMembers, function (_member) { return _member.user.id === userToUpdate.id; }); })
                                .then(function (_teamMember) {
                                chai_1.expect(_teamMember.isAdmin).to.be.equal(!originalIsAdmin);
                                done();
                            });
                        });
                    });
                    it('with user that is not in the team should fail', function (done) {
                        server.delete('/teams/' + teamToUpdateTheUserIn.id + '/members')
                            .send({ userId: userToUpdate.id })
                            .end(function () {
                            server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                                .send({ isAdmin: !originalIsAdmin })
                                .expect(statusCode_1.StatusCode.NOT_FOUND)
                                .end(done);
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
                            team_id: teamToUpdateTheUserIn.id,
                            user_id: executingUser.id,
                            is_admin: true
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is regular team member', function () {
                    beforeEach(function () {
                        var teamMemberInfo = {
                            team_id: teamToUpdateTheUserIn.id,
                            user_id: executingUser.id,
                            is_admin: false
                        };
                        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
                    });
                    it('should fail', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .send({ isAdmin: !originalIsAdmin })
                            .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                            .end(done);
                    });
                    it('without sufficient permissions should not update the user admin rights', function (done) {
                        server.patch('/teams/' + teamToUpdateTheUserIn.id + '/members/' + userToUpdate.id + '/admin')
                            .send({ isAdmin: !originalIsAdmin })
                            .end(function () {
                            teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToUpdateTheUserIn.id)
                                .then(function (_teamMembers) { return _.find(_teamMembers, function (_member) { return _member.user.id === userToUpdate.id; }); })
                                .then(function (_teamMember) {
                                chai_1.expect(_teamMember.isAdmin).to.be.equal(originalIsAdmin);
                                done();
                            });
                        });
                    });
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