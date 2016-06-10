"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var updateUserTeamAdminRightsOperation_1 = require("./updateUserTeamAdminRightsOperation");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('UpdateUserTeamAdminRightsOperation', function () {
    var teamOfTheUser;
    var otherTeam;
    var executingUser;
    var adminUser;
    var notAdminUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1')),
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team2'))
        ]); }).then(function (_teams) {
            teamOfTheUser = _teams[0], otherTeam = _teams[1];
        }).then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3))
        ]); }).then(function (_users) {
            executingUser = _users[0], adminUser = _users[1], notAdminUser = _users[2];
        }).then(function () {
            var adminTeamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, adminUser);
            adminTeamMemberInfo.is_admin = true;
            var notAdminTeamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, notAdminUser);
            adminTeamMemberInfo.is_admin = false;
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(adminTeamMemberInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(notAdminTeamMemberInfo)
            ]);
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        function verifyTeamMemberAdminRights(modifiedUser, shouldBeAdmin, teamMembers) {
            var teamMember = _.find(teamMembers, function (_teamMember) { return _teamMember.user.id === modifiedUser.id; });
            chai_1.expect(teamMember.isAdmin).to.be.equal(shouldBeAdmin);
        }
        describe('executing user is not part of the team and has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('not admin to admin should reject', function () {
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, true, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('admin not to admin should reject', function () {
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, false, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is global admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('not admin to admin should set as admin', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
                });
            });
            it('admin to not admin should set as not admin', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
                });
            });
        });
        describe('executing user is teams list admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('not admin to admin should set as admin', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
                });
            });
            it('admin to not admin should set as not admin', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
                });
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('admin to not admin should reject', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('not admin to admin should reject', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('not admin to admin should set as admin', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
                });
            });
            it('admin to not admin should set as not admin', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
                });
            });
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('admin to not admin should reject', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('admin to not admin should reject', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('admin to not admin should reject', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('not admin to admin should reject', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, teamOfTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
    });
});
