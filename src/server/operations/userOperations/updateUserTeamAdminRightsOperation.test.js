"use strict";
var notFoundError_1 = require("../../../common/errors/notFoundError");
var errorUtils_1 = require("../../../common/errors/errorUtils");
var globalPermission_1 = require("../../models/enums/globalPermission");
var updateUserTeamAdminRightsOperation_1 = require("./updateUserTeamAdminRightsOperation");
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
    var team;
    var otherTeam;
    var executingUser;
    var adminUser;
    var notAdminUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3))
        ]); }).then(function (_users) {
            executingUser = _users[0], adminUser = _users[1], notAdminUser = _users[2];
        })
            .then(function () { return Promise.all([
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1'), adminUser.id),
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team2'), adminUser.id)
        ]); }).then(function (_teams) {
            team = _teams[0], otherTeam = _teams[1];
        }).then(function () {
            var adminTeamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, adminUser);
            adminTeamMemberInfo.is_admin = true;
            var notAdminTeamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, notAdminUser);
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
    describe('canUpdateUserRights', function () {
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
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
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
            it('should succeed', function () {
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
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
            it('should succeed', function () {
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should reject', function () {
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should succeed', function () {
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should reject', function () {
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should reject', function () {
                var result = updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(team.id, executingUser.id);
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
    });
    describe('execute', function () {
        function verifyTeamMemberAdminRights(modifiedUser, shouldBeAdmin, teamMembers) {
            var teamMember = _.find(teamMembers, function (_teamMember) { return _teamMember.user.id === modifiedUser.id; });
            chai_1.expect(teamMember.isAdmin).to.be.equal(shouldBeAdmin);
        }
        var sufficientPermissionsTests = function () {
            it('not admin to admin should set as admin', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, team.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(notAdminUser, shouldBeAdmin, _teamMembers);
                });
            });
            it('admin to not admin should set as not admin', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, team.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team.id); })
                    .then(function (_teamMembers) {
                    verifyTeamMemberAdminRights(adminUser, shouldBeAdmin, _teamMembers);
                });
            });
            describe('user to update is not part of the team', function () {
                var notInTeamUser;
                beforeEach(function () {
                    return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(12, 'notInTeam'))
                        .then(function (_user) {
                        notInTeamUser = _user;
                    });
                });
                it('user to update is not part of the team should fail correctly', function () {
                    var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notInTeamUser.id, team.id, false, executingUser.id);
                    var result = operation.execute();
                    return chai_1.expect(result).to.eventually.rejected
                        .then(function (_error) {
                        chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)).to.be.true;
                    });
                });
            });
        };
        var insufficientPermissionsTests = function () {
            it('admin to not admin should reject', function () {
                var shouldBeAdmin = false;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, team.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('not admin to admin should reject', function () {
                var shouldBeAdmin = true;
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, team.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        };
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
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(notAdminUser.id, team.id, true, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('admin not to admin should reject', function () {
                var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(adminUser.id, team.id, false, executingUser.id);
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
            sufficientPermissionsTests();
        });
        describe('executing user is teams list admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            sufficientPermissionsTests();
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            insufficientPermissionsTests();
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            sufficientPermissionsTests();
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            insufficientPermissionsTests();
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            insufficientPermissionsTests();
        });
    });
});
//# sourceMappingURL=updateUserTeamAdminRightsOperation.test.js.map