"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var upvoteTeamSkillOperation_1 = require('./upvoteTeamSkillOperation');
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('UpvoteTeamSkillOperation', function () {
    var team;
    var skillToUpvote;
    var teamSkillToUpvote;
    var executingUser;
    var operation;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)); })
            .then(function (_user) {
            executingUser = _user;
        })
            .then(function () { return teamsDataHandler_1.TeamsDataHandler.createTeam(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team')); })
            .then(function (_team) {
            team = _team;
        })
            .then(function () { return skillsDataHandler_1.SkillsDataHandler.createSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill')); })
            .then(function (_skill) {
            skillToUpvote = _skill;
        })
            .then(function () { return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skillToUpvote)); })
            .then(function (_teamSkill) {
            teamSkillToUpvote = _teamSkill;
        })
            .then(function () {
            operation = new upvoteTeamSkillOperation_1.UpvoteTeamSkillOperation(skillToUpvote.id, team.id, executingUser.id);
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('canExecute', function () {
        describe('skill has no upvotes', function () {
            it('executing user has no permissions should fail', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
            it('executing user has GUEST permissions should fail', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
            it('executing user has READER permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.READER
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('executing user has SKILLS_LIST_ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('executing user has TEAMS_LIST_ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('executing user has ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
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
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillToUpvote.id, otherUser.id); });
            });
            it('executing user has no permissions should fail', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
            it('executing user has GUEST permissions should fail', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
            it('executing user has READER permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.READER
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('executing user has SKILLS_LIST_ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('executing user has TEAMS_LIST_ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('executing user has ADMIN permissions should succeed', function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
                var resultPromise = permissionsPromise.then(function () { return operation.canExecute(); });
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
        });
    });
    describe('execute', function () {
        describe('skill is not a team skill', function () {
            beforeEach(function () {
                return teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(team.id, skillToUpvote.id);
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
                    chai_1.expect(_teamSkills).to.be.length(0);
                });
            });
        });
        describe('skill has no upvotes', function () {
            it('executing user has no permissions should fail', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
                });
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
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillToUpvote.id, otherUser.id); });
            });
            it('executing user has no permissions should fail', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                    .then(function (_teamSkills) {
                    chai_1.expect(_teamSkills).to.be.length(1);
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([otherUser.id]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([otherUser.id]);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds.sort()).to.be.deep.equal([otherUser.id, executingUser.id].sort());
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds.sort()).to.be.deep.equal([executingUser.id, otherUser.id].sort());
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds.sort()).to.be.deep.equal([executingUser.id, otherUser.id].sort());
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds.sort()).to.be.deep.equal([executingUser.id, otherUser.id].sort());
                });
            });
        });
        describe('skill has upvote from executing user', function () {
            beforeEach(function () {
                return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillToUpvote.id, executingUser.id);
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
                    chai_1.expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToUpvote.id);
                    chai_1.expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
                });
                ;
            });
        });
    });
});
