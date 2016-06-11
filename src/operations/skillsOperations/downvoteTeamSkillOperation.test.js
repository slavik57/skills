"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var downvoteTeamSkillOperation_1 = require('./downvoteTeamSkillOperation');
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('DownvoteTeamSkillOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var team;
        var skillToDownvote;
        var teamSkillToDownvote;
        var executingUser;
        var operation;
        beforeEach(function () {
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1))
                .then(function (_user) {
                executingUser = _user;
            });
            var createTeamPromise = teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team'))
                .then(function (_team) {
                team = _team;
            });
            var createSkillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill'))
                .then(function (_skill) {
                skillToDownvote = _skill;
            });
            return Promise.all([
                createUserPromise,
                createTeamPromise,
                createSkillPromise
            ]).then(function () { return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skillToDownvote)); })
                .then(function (_teamSkill) {
                teamSkillToDownvote = _teamSkill;
            })
                .then(function () {
                operation = new downvoteTeamSkillOperation_1.DownvoteTeamSkillOperation(skillToDownvote.id, team.id, executingUser.id);
            });
        });
        describe('skill is not a team skill', function () {
            beforeEach(function () {
                return teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(team.id, skillToDownvote.id);
            });
            it('executing user has all permissions should fail', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
        describe('skill has no upvotes', function () {
            it('executing user has all permissions should fail', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
        describe('skill has upvote from different user', function () {
            var otherUser;
            beforeEach(function () {
                var createOtherUserPromise = userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
                    .then(function (_user) {
                    otherUser = _user;
                });
                return createOtherUserPromise
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillToDownvote.id, otherUser.id); });
            });
            it('executing user has all permissions should fail', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([otherUser.id]);
                });
            });
        });
        describe('skill has upvote from executing user', function () {
            beforeEach(function () {
                return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillToDownvote.id, executingUser.id);
            });
            it('executing user has no permissions should fail', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
                });
            });
            it('executing user has GUEST permissions should fail', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
                });
            });
            it('executing user has READER permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.READER
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
                });
            });
            it('executing user has SKILLS_LIST_ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
                });
            });
            it('executing user has TEAMS_LIST_ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
                });
            });
            it('executing user has ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.execute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
                });
            });
        });
    });
});
