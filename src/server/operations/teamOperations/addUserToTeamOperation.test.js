"use strict";
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
var notFoundError_1 = require("../../../common/errors/notFoundError");
var errorUtils_1 = require("../../../common/errors/errorUtils");
var globalPermission_1 = require("../../models/enums/globalPermission");
var addUserToTeamOperation_1 = require("./addUserToTeamOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('AddUserToTeamOperation', function () {
    var teamToAddTheUser;
    var otherTeam;
    var executingUser;
    var userToAdd;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
            userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
        ]); }).then(function (_users) {
            executingUser = _users[0], userToAdd = _users[1];
        })
            .then(function () { return Promise.all([
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1'), executingUser.id),
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team2'), executingUser.id)
        ]); }).then(function (_teams) {
            teamToAddTheUser = _teams[0], otherTeam = _teams[1];
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
            it('should reject', function () {
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);
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
            it('add as admin should fulfil', function () {
                var shouldBeAdmin = true;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('add not as admin should fulfil', function () {
                var shouldBeAdmin = false;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
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
            it('add as admin should fulfil', function () {
                var shouldBeAdmin = true;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('add not as admin should fulfil', function () {
                var shouldBeAdmin = false;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should reject', function () {
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('add as admin should fulfil', function () {
                var shouldBeAdmin = true;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('add not as admin should fulfil', function () {
                var shouldBeAdmin = false;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
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
            it('should reject', function () {
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);
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
            it('should reject', function () {
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
    });
    describe('execute', function () {
        function verifyUserIsTeamMember(userToAdd, shouldBeAdmin, teamMembers) {
            var teamMember = _.find(teamMembers, function (_teamMember) { return _teamMember.user.id === userToAdd.id; });
            chai_1.expect(teamMember.isAdmin).to.be.equal(shouldBeAdmin);
        }
        var unauthorizedTests = function () {
            it('should reject', function () {
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        };
        var authorizedTests = function () {
            it('add as admin should add user to the team correctly', function () {
                var shouldBeAdmin = true;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToAddTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsTeamMember(userToAdd, shouldBeAdmin, _teamMembers);
                });
            });
            it('add not as admin should add user to the team correctly', function () {
                var shouldBeAdmin = false;
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, shouldBeAdmin, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamToAddTheUser.id); })
                    .then(function (_teamMembers) {
                    verifyUserIsTeamMember(userToAdd, shouldBeAdmin, _teamMembers);
                });
            });
            it('add not existing user should fail', function () {
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation('not existing username', teamToAddTheUser.id, false, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)).to.be.true;
                });
            });
            it('add a user that is already in the team should fail correctly', function () {
                var existingTeamMemberInfo = {
                    team_id: teamToAddTheUser.id,
                    user_id: userToAdd.id,
                    is_admin: false
                };
                var addExistingTeamMemberPromise = teamsDataHandler_1.TeamsDataHandler.addTeamMember(existingTeamMemberInfo);
                var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(userToAdd.attributes.username, teamToAddTheUser.id, false, executingUser.id);
                var result = addExistingTeamMemberPromise
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
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
            unauthorizedTests();
        });
        describe('executing user is global admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            authorizedTests();
        });
        describe('executing user is teams list admin', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            authorizedTests();
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            unauthorizedTests();
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheUser, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            authorizedTests();
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            unauthorizedTests();
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            unauthorizedTests();
        });
    });
});
//# sourceMappingURL=addUserToTeamOperation.test.js.map