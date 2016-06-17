"use strict";
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var addRemoveTeamSkillOperationBase_1 = require("./addRemoveTeamSkillOperationBase");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('AddRemoveTeamSkillOperationBase', function () {
    var teamToAddTheSkillTo;
    var otherTeam;
    var executingUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1')),
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team2'))
        ]); }).then(function (_teams) {
            teamToAddTheSkillTo = _teams[0], otherTeam = _teams[1];
        }).then(function () { return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)); })
            .then(function (_user) {
            executingUser = _user;
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('canExecute', function () {
        describe('executing user is not part of the team and has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should reject', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
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
            it('should succeed', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
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
            it('shoud fail', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheSkillTo, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should succeed', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamToAddTheSkillTo, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('should succeed', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
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
            it('should fail', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
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
            it('should fail', function () {
                var operation = new addRemoveTeamSkillOperationBase_1.AddRemoveTeamSkillOperationBase(teamToAddTheSkillTo.id, executingUser.id);
                var result = operation.canExecute();
                return chai_1.expect(result).to.eventually.rejected;
            });
        });
    });
});
//# sourceMappingURL=addRemoveTeamSkillOperationBase.test.js.map