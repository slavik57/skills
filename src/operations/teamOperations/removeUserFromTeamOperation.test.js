"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var removeUserFromTeamOperation_1 = require("./removeUserFromTeamOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
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
    describe('canExecute', function () {
        describe('executing user is not part of the team and has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('removing not admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('removing admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
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
            it('removing not admin user should fulfil', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('removing admin user should fulfil', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is teams list admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('removing not admin user shoud fulfil', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('removing admin user shoud fulfil', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing admin user should reject', function () {
                var shouldBeAdmin = false;
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('removing not admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
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
            it('removing not admin user should fulfil', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('removing admin user should fulfil', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('removing not admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('removing not admin user should reject', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
    });
    describe('execute', function () {
        function verifyUserIsNotInTheTeam(modifiedUser, teamMembers) {
            var teamMember = _.find(teamMembers, function (_teamMember) { return _teamMember.user.id === modifiedUser.id; });
            chai_1.expect(teamMember).to.be.undefined;
        }
        function verifyUserIsInTheTeam(modifiedUser, teamMembers) {
            var teamMember = _.find(teamMembers, function (_teamMember) { return _teamMember.user.id === modifiedUser.id; });
            chai_1.expect(teamMember).to.not.be.undefined;
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
            it('removing not admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(notAdminUser, _teamMembers);
                });
            });
            it('removing admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(adminUser, _teamMembers);
                });
            });
        });
        describe('executing user is global admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('removing not admin user should remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsNotInTheTeam(notAdminUser, _teamMembers);
                });
            });
            it('removing admin user should remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsNotInTheTeam(adminUser, _teamMembers);
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
            it('removing not admin user shoud remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsNotInTheTeam(notAdminUser, _teamMembers);
                });
            });
            it('removing admin user shoud remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsNotInTheTeam(adminUser, _teamMembers);
                });
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing admin user should reject and not remove', function () {
                var shouldBeAdmin = false;
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(adminUser, _teamMembers);
                });
            });
            it('removing not admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(notAdminUser, _teamMembers);
                });
            });
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheUser, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing not admin user should remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsNotInTheTeam(notAdminUser, _teamMembers);
                });
            });
            it('removing admin user should remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsNotInTheTeam(adminUser, _teamMembers);
                });
            });
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(adminUser, _teamMembers);
                });
            });
            it('removing not admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(notAdminUser, _teamMembers);
                });
            });
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(adminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(adminUser, _teamMembers);
                });
            });
            it('removing not admin user should reject and not remove', function () {
                var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(notAdminUser.id, teamOfTheUser.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamOfTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsInTheTeam(notAdminUser, _teamMembers);
                });
            });
        });
    });
});
