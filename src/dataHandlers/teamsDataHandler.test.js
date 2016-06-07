"use strict";
var modelInfoComparers_1 = require("../testUtils/modelInfoComparers");
var modelVerificator_1 = require("../testUtils/modelVerificator");
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var skillsDataHandler_1 = require("./skillsDataHandler");
var skill_1 = require("../models/skill");
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var team_1 = require('../models/team');
var teamMember_1 = require('../models/teamMember');
var user_1 = require('../models/user');
var teamsDataHandler_1 = require('./teamsDataHandler');
var userDataHandler_1 = require('./userDataHandler');
var teamSkill_1 = require('../models/teamSkill');
chai.use(chaiAsPromised);
describe('TeamsDataHandler', function () {
    function clearTables() {
        return teamSkillUpvote_1.TeamSkillUpvotes.clearAll()
            .then(function () { return Promise.all([
            teamMember_1.TeamMembers.clearAll(),
            teamSkill_1.TeamSkills.clearAll()
        ]); }).then(function () { return Promise.all([
            team_1.Teams.clearAll(),
            user_1.Users.clearAll(),
            skill_1.Skills.clearAll()
        ]); });
    }
    beforeEach(function () {
        return clearTables();
    });
    afterEach(function () {
        return clearTables();
    });
    describe('createTeam', function () {
        it('should create a team correctly', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo);
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(teamPromise, teamInfo);
        });
    });
    describe('getTeam', function () {
        it('no such team should return null', function () {
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.getTeam(9999999);
            return chai_1.expect(teamPromise).to.eventually.null;
        });
        it('team exists should return correct team', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var createTeamPromose = teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo);
            var getTeamPromise = createTeamPromose.then(function (team) { return teamsDataHandler_1.TeamsDataHandler.getTeam(team.id); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getTeamPromise, teamInfo);
        });
    });
    describe('addTeamMember', function () {
        it('should create a team member', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var createTeamAndUserPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                userDataHandler_1.UserDataHandler.createUser(userInfo)
            ]);
            var teamMemberPromise = createTeamAndUserPromise.then(function (teamAndUser) {
                var team = teamAndUser[0];
                var user = teamAndUser[1];
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, user);
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            return chai_1.expect(teamMemberPromise).to.eventually.fulfilled;
        });
    });
    describe('getTeamMembers', function () {
        function verifyUsersAdminSettingsWithoutOrderAsync(actualUserOfATeamsPromise, expectedAdminSettings) {
            return chai_1.expect(actualUserOfATeamsPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var orderedActualUsers = _.orderBy(actualTeams, function (_) { return _.user.id; });
                var actualIsAdmin = _.map(orderedActualUsers, function (_) { return _.isAdmin; });
                var orderedExpectedAdminSettings = _.orderBy(expectedAdminSettings, function (_) { return _.userId; });
                var expectedIsAdmin = _.map(orderedExpectedAdminSettings, function (_) { return _.isAdmin; });
                chai_1.expect(actualIsAdmin).to.deep.equal(expectedIsAdmin);
            });
        }
        var userInfo1;
        var userInfo2;
        var userInfo3;
        var user1;
        var user2;
        var user3;
        var teamInfo1;
        var teamInfo2;
        var team1;
        var team2;
        beforeEach(function () {
            userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            userInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3);
            teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo3)
            ]).then(function (teamAndUsers) {
                team1 = teamAndUsers[0];
                team2 = teamAndUsers[1];
                user1 = teamAndUsers[2];
                user2 = teamAndUsers[3];
                user3 = teamAndUsers[4];
            });
        });
        it('not existing team should return empty', function () {
            var teamMembersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers(999999);
            return chai_1.expect(teamMembersPromise).to.eventually.deep.equal([]);
        });
        it('no team members should return empty', function () {
            var teamMembersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id);
            return chai_1.expect(teamMembersPromise).to.eventually.deep.equal([]);
        });
        it('should return all existing team members', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2)
            ]);
            var usersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id); })
                .then(function (teamMembers) {
                return _.map(teamMembers, function (_) { return _.user; });
            });
            var expectedUserInfo = [userInfo1, userInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromise, expectedUserInfo, modelInfoComparers_1.ModelInfoComparers.compareUserInfos);
        });
        it('should return all existing team members with correct admin rights', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            teamMemberInfo1.is_admin = true;
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            teamMemberInfo2.is_admin = false;
            var teamMemberInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user3);
            teamMemberInfo3.is_admin = true;
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamMembersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id); });
            var expectedUserAdminConfigurations = [
                { userId: teamMemberInfo1.user_id, isAdmin: teamMemberInfo1.is_admin },
                { userId: teamMemberInfo2.user_id, isAdmin: teamMemberInfo2.is_admin },
                { userId: teamMemberInfo3.user_id, isAdmin: teamMemberInfo3.is_admin }
            ];
            return verifyUsersAdminSettingsWithoutOrderAsync(teamMembersPromise, expectedUserAdminConfigurations);
        });
        it('should return all existing team members and not return other members', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            var teamMemberInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
            var teamMemberInfo4 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user3);
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo4)
            ]);
            var usersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id); })
                .then(function (usersOfATeam) {
                return _.map(usersOfATeam, function (_) { return _.user; });
            });
            var expectedUserInfo = [userInfo1, userInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromise, expectedUserInfo, modelInfoComparers_1.ModelInfoComparers.compareUserInfos);
        });
    });
    describe('addTeamSkill', function () {
        it('should create a team skill', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1');
            var createTeamAndSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo)
            ]);
            var teamSkillPromise = createTeamAndSkillsPromise.then(function (teamAndSkill) {
                var team = teamAndSkill[0];
                var skill = teamAndSkill[1];
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            });
            return chai_1.expect(teamSkillPromise).to.eventually.fulfilled;
        });
    });
    describe('getTeamSkills', function () {
        function verifySkillsUpvotesWithoutOrderAsync(actualSkillsOfATeamPromise, expectedSkillIdToUpvotes) {
            return chai_1.expect(actualSkillsOfATeamPromise).to.eventually.fulfilled
                .then(function (actualSkills) {
                var orderedActualUsers = _.orderBy(actualSkills, function (_) { return _.skill.id; });
                var actualUpvotingUserIds = _.map(orderedActualUsers, function (_) { return _.upvotingUserIds.sort(); });
                var orderedExpectedUpvotes = _.orderBy(expectedSkillIdToUpvotes, function (_) { return _.skillId; });
                var expectedUpvotingUserIds = _.map(orderedExpectedUpvotes, function (_) { return _.upvotingUserIds.sort(); });
                chai_1.expect(actualUpvotingUserIds).to.deep.equal(expectedUpvotingUserIds);
            });
        }
        var skillInfo1;
        var skillInfo2;
        var skillInfo3;
        var skill1;
        var skill2;
        var skill3;
        var teamInfo1;
        var teamInfo2;
        var team1;
        var team2;
        var userInfo1;
        var userInfo2;
        var user1;
        var user2;
        beforeEach(function () {
            skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1');
            skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill2');
            skillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill3');
            teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3),
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ]).then(function (results) {
                team1 = results[0];
                team2 = results[1];
                skill1 = results[2];
                skill2 = results[3];
                skill3 = results[4];
                user1 = results[5];
                user2 = results[6];
            });
        });
        it('not existing team should return empty', function () {
            var teamSkillsPromise = teamsDataHandler_1.TeamsDataHandler.getTeamSkills(99999);
            return chai_1.expect(teamSkillsPromise).to.eventually.deep.equal([]);
        });
        it('no team members should return empty', function () {
            var teamSkillsPromise = teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id);
            return chai_1.expect(teamSkillsPromise).to.eventually.deep.equal([]);
        });
        it('should return all existing team skills', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2)
            ]);
            var skillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); })
                .then(function (skillsOfATeam) {
                return _.map(skillsOfATeam, function (_) { return _.skill; });
            });
            var expectedSkillInfo = [skillInfo1, skillInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return all existing team skills with correct upvoting user ids', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill3);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); });
            var expectedSkillUpvotes = [
                { skillId: teamSkillInfo1.skill_id, upvotingUserIds: [] },
                { skillId: teamSkillInfo2.skill_id, upvotingUserIds: [] },
                { skillId: teamSkillInfo3.skill_id, upvotingUserIds: [] }
            ];
            return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
        });
        it('should return all existing skills and not return other skills', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
            var teamSkillInfo4 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill3);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo4)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); })
                .then(function (skillsOfATeam) {
                return _.map(skillsOfATeam, function (_) { return _.skill; });
            });
            var expectedSkillsInfo = [skillInfo1, skillInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamSkillsPromise, expectedSkillsInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('after upvoting skills should return all existing team skills with correct upvoting user ids', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill3);
            var createSkillsAndUpvotePromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]).then(function (teamSkills) {
                var teamSkill1 = teamSkills[0], teamSkill2 = teamSkills[1], teamSkill3 = teamSkills[2];
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill1.id, user1.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill1.id, user2.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill2.id, user2.id)
                ]);
            });
            var teamSkillsPromise = createSkillsAndUpvotePromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); });
            var expectedSkillUpvotes = [
                { skillId: skill1.id, upvotingUserIds: [user1.id, user2.id] },
                { skillId: skill2.id, upvotingUserIds: [user2.id] },
                { skillId: skill3.id, upvotingUserIds: [] }
            ];
            return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
        });
    });
    describe('upvoteTeamSkill', function () {
        var teamInfo;
        var team;
        var user1;
        var user2;
        var teamSkill;
        beforeEach(function () {
            teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team 1');
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill 1');
            var userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo),
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ]).then(function (teamSkillAndUser) {
                team = teamSkillAndUser[0];
                var skill = teamSkillAndUser[1];
                user1 = teamSkillAndUser[2];
                user2 = teamSkillAndUser[3];
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            }).then(function (_teamSkill) {
                teamSkill = _teamSkill;
            });
        });
        it('upvote with non existing team skill id should fail', function () {
            var teamSkillId = teamSkill.id + 1;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote with non existing user id should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id + user2.id + 1;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([userId]);
            });
        });
        it('upvote with same user twice should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId); });
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote with same user twice should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId); });
            return chai_1.expect(upvotePromise).to.eventually.rejected
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([userId]);
            });
        });
        it('upvote with different user twice set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId1 = user1.id;
            var userId2 = user2.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId1)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId2); });
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([userId1, userId2].sort());
            });
        });
    });
    describe('removeUpvoteForTeamSkill', function () {
        var upvotedUser1;
        var upvotedUser2;
        var notUpvotedUser;
        var teamInfo;
        var team;
        var teamSkill;
        beforeEach(function () {
            teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team 1');
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill 1');
            var upvotedUserInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var upvotedUserInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            var notUpvotedUserInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo),
                userDataHandler_1.UserDataHandler.createUser(upvotedUserInfo1),
                userDataHandler_1.UserDataHandler.createUser(upvotedUserInfo2),
                userDataHandler_1.UserDataHandler.createUser(notUpvotedUserInfo)
            ]).then(function (teamSkillAndUser) {
                team = teamSkillAndUser[0];
                var skill = teamSkillAndUser[1];
                upvotedUser1 = teamSkillAndUser[2];
                upvotedUser2 = teamSkillAndUser[3];
                notUpvotedUser = teamSkillAndUser[4];
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            }).then(function (_teamSkill) {
                teamSkill = _teamSkill;
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill.id, upvotedUser1.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill.id, upvotedUser2.id)
                ]);
            });
        });
        it('with non existing team skill id should fail', function () {
            var teamSkillId = teamSkill.id + 1;
            var userId = upvotedUser1.id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('with non existing user id should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id + upvotedUser2.id + notUpvotedUser.id + 1;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('with user who did not upvote should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = notUpvotedUser.id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('with user who did not upvote should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = notUpvotedUser.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(removeUpvotePromise).to.eventually.rejected
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([upvotedUser1.id, upvotedUser2.id].sort());
            });
        });
        it('with user who upvote should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(removeUpvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([upvotedUser2.id]);
            });
        });
        it('with same user twice should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId); });
            return chai_1.expect(removeUpvotePromise).to.eventually.rejected;
        });
        it('with same user twice should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId); });
            return chai_1.expect(removeUpvotePromise).to.eventually.rejected
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([upvotedUser2.id]);
            });
        });
        it('with different user twice set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId1 = upvotedUser1.id;
            var userId2 = upvotedUser2.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId1)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId2); });
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([]);
            });
        });
    });
    describe('setAdminRights', function () {
        var teamInfo;
        var team;
        var teamMemberInfo;
        var userInfo;
        beforeEach(function () {
            teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team 1');
            userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                userDataHandler_1.UserDataHandler.createUser(userInfo)
            ]).then(function (teamAndUser) {
                team = teamAndUser[0];
                var user = teamAndUser[1];
                teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, user);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
        });
        it('with non existing team id should fail', function () {
            var teamId = teamMemberInfo.team_id + 1;
            var userId = teamMemberInfo.user_id;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true);
            return chai_1.expect(adminRightsPromise).to.eventually.rejected;
        });
        it('with non existing user id should fail', function () {
            var teamId = teamMemberInfo.team_id;
            var userId = teamMemberInfo.user_id + 1;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true);
            return chai_1.expect(adminRightsPromise).to.eventually.rejected;
        });
        it('should update the is_admin to true correctly', function () {
            var teamId = teamMemberInfo.team_id;
            var userId = teamMemberInfo.user_id;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true);
            return chai_1.expect(adminRightsPromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team.id); })
                .then(function (usersOfATeam) {
                chai_1.expect(usersOfATeam.length).to.be.equal(1);
                chai_1.expect(usersOfATeam[0].isAdmin).to.be.true;
            });
        });
        it('should update the is_admin to false correctly', function () {
            var teamId = teamMemberInfo.team_id;
            var userId = teamMemberInfo.user_id;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, false); });
            return chai_1.expect(adminRightsPromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team.id); })
                .then(function (usersOfATeam) {
                chai_1.expect(usersOfATeam.length).to.be.equal(1);
                chai_1.expect(usersOfATeam[0].isAdmin).to.be.false;
            });
        });
    });
});
