"use strict";
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var removeTeamSkillOperation_1 = require("./removeTeamSkillOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('RemoveTeamSkillOperation', function () {
    var teamOfTheSkill;
    var otherTeam;
    var executingUser;
    var skillToRemove;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return Promise.all([
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team1')),
            teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team2'))
        ]); }).then(function (_teams) {
            teamOfTheSkill = _teams[0], otherTeam = _teams[1];
        }).then(function () { return skillsDataHandler_1.SkillsDataHandler.createSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1')); })
            .then(function (_skill) {
            skillToRemove = _skill;
        }).then(function () { return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)); })
            .then(function (_user) {
            executingUser = _user;
        }).then(function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teamOfTheSkill, skillToRemove);
            return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        function verifyTeamDoesNotHaveTheSkill(modifiedSkill, teamSkills) {
            var teamSkill = _.find(teamSkills, function (_teamSkill) { return _teamSkill.skill.id === modifiedSkill.id; });
            chai_1.expect(teamSkill).to.be.undefined;
        }
        function verifyTeamHasTheSkill(modifiedSkill, teamSkills) {
            var teamSkill = _.find(teamSkills, function (_teamSkill) { return _teamSkill.skill.id === modifiedSkill.id; });
            chai_1.expect(teamSkill).to.not.be.undefined;
        }
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
            it('removing skill should reject and not remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamHasTheSkill(skillToRemove, _teamSkills);
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
            it('removing skill should remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamDoesNotHaveTheSkill(skillToRemove, _teamSkills);
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
            it('removing skill shoud not remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamHasTheSkill(skillToRemove, _teamSkills);
                });
            });
        });
        describe('executing user is a simple team member', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheSkill, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing skill should succeed and remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamDoesNotHaveTheSkill(skillToRemove, _teamSkills);
                });
            });
        });
        describe('executing user is a team admin', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(teamOfTheSkill, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing skill should remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamDoesNotHaveTheSkill(skillToRemove, _teamSkills);
                });
            });
        });
        describe('executing user is a simple team member of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing skill should reject and not remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamHasTheSkill(skillToRemove, _teamSkills);
                });
            });
        });
        describe('executing user is a team admin of another team', function () {
            beforeEach(function () {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(otherTeam, executingUser);
                teamMemberInfo.is_admin = true;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            it('removing skill should reject and not remove', function () {
                var operation = new removeTeamSkillOperation_1.RemoveTeamSkillOperation(skillToRemove.id, teamOfTheSkill.id, executingUser.id);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamOfTheSkill.id); })
                    .then(function (_teamSkills) {
                    verifyTeamHasTheSkill(skillToRemove, _teamSkills);
                });
            });
        });
    });
});
//# sourceMappingURL=removeTeamSkillOperation.test.js.map