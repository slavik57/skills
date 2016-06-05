"use strict";
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
        return Promise.all([
            teamMember_1.TeamMembers.clearAll(),
            teamSkill_1.TeamSkills.clearAll()
        ]).then(function () { return Promise.all([
            team_1.Teams.clearAll(),
            user_1.Users.clearAll(),
            skill_1.Skills.clearAll()
        ]); });
    }
    function createTeamInfo(teamName) {
        return {
            name: teamName
        };
    }
    function createUserInfo(userNumber) {
        return {
            username: 'username' + userNumber,
            password_hash: 'password_hash' + userNumber,
            email: 'email' + userNumber + '@gmail.com',
            firstName: 'firstName' + userNumber,
            lastName: 'lastName' + userNumber
        };
    }
    function createTeamMemberInfo(team, user) {
        return {
            team_id: team.id,
            user_id: user.id,
            is_admin: false
        };
    }
    function createSkillInfo(skillName) {
        return {
            name: skillName
        };
    }
    function createTeamSkillInfo(team, skill) {
        return {
            team_id: team.id,
            skill_id: skill.id,
            upvotes: 0
        };
    }
    function verifyTeamInfoAsync(actualTeamPromise, expectedTeamInfo) {
        return chai_1.expect(actualTeamPromise).to.eventually.fulfilled
            .then(function (team) {
            verifyTeamInfo(team.attributes, expectedTeamInfo);
        });
    }
    function verifyTeamInfo(actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned['id'];
        delete expectedCloned['id'];
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    }
    beforeEach(function () {
        return clearTables();
    });
    afterEach(function () {
        return clearTables();
    });
    describe('createTeam', function () {
        it('should create a team correctly', function () {
            var teamInfo = createTeamInfo('a');
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo);
            return verifyTeamInfoAsync(teamPromise, teamInfo);
        });
    });
    describe('getTeam', function () {
        it('no such team should return null', function () {
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.getTeam('not existing team');
            return chai_1.expect(teamPromise).to.eventually.null;
        });
        it('team exists should return correct team', function () {
            var teamInfo = createTeamInfo('a');
            var createTeamPromose = teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo);
            var getTeamPromise = createTeamPromose.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeam(teamInfo.name); });
            return verifyTeamInfoAsync(getTeamPromise, teamInfo);
        });
    });
    describe('addTeamMember', function () {
        it('should create a team member', function () {
            var teamInfo = createTeamInfo('a');
            var userInfo = createUserInfo(1);
            var createTeamAndUserPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                userDataHandler_1.UserDataHandler.createUser(userInfo)
            ]);
            var teamMemberPromise = createTeamAndUserPromise.then(function (teamAndUser) {
                var team = teamAndUser[0];
                var user = teamAndUser[1];
                var teamMemberInfo = createTeamMemberInfo(team, user);
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            return chai_1.expect(teamMemberPromise).to.eventually.fulfilled;
        });
    });
    describe('getTeamMembers', function () {
        function verifyUsersInfoWithoutOrderAsync(actualUsersPromise, expectedUsersInfo) {
            return chai_1.expect(actualUsersPromise).to.eventually.fulfilled
                .then(function (users) {
                var actualUserInfos = _.map(users, function (_) { return _.user.attributes; });
                verifyUsersInfoWithoutOrder(actualUserInfos, expectedUsersInfo);
            });
        }
        function verifyUsersInfoWithoutOrder(actual, expected) {
            var actualOrdered = _.orderBy(actual, function (_) { return _.username; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.username; });
            chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
            for (var i = 0; i < expected.length; i++) {
                verifyUserInfo(actualOrdered[i], expectedOrdered[i]);
            }
        }
        function verifyUserInfo(actual, expected) {
            var actualCloned = _.clone(actual);
            var expectedCloned = _.clone(expected);
            delete actualCloned['id'];
            delete expectedCloned['id'];
            chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
        }
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
            userInfo1 = createUserInfo(1);
            userInfo2 = createUserInfo(2);
            userInfo3 = createUserInfo(3);
            teamInfo1 = createTeamInfo('a');
            teamInfo2 = createTeamInfo('b');
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
            var teamMembersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers('not existing team');
            return chai_1.expect(teamMembersPromise).to.eventually.deep.equal([]);
        });
        it('no team members should return empty', function () {
            var teamMembersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamInfo1.name);
            return chai_1.expect(teamMembersPromise).to.eventually.deep.equal([]);
        });
        it('should return all existing team members', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team1, user2);
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2)
            ]);
            var teamMembersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamInfo1.name); });
            var expectedUserInfo = [userInfo1, userInfo2];
            return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedUserInfo);
        });
        it('should return all existing team members with correct admin rights', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            teamMemberInfo1.is_admin = true;
            var teamMemberInfo2 = createTeamMemberInfo(team1, user2);
            teamMemberInfo2.is_admin = false;
            var teamMemberInfo3 = createTeamMemberInfo(team1, user3);
            teamMemberInfo3.is_admin = true;
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamMembersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamInfo1.name); });
            var expectedUserAdminConfigurations = [
                { userId: teamMemberInfo1.user_id, isAdmin: teamMemberInfo1.is_admin },
                { userId: teamMemberInfo2.user_id, isAdmin: teamMemberInfo2.is_admin },
                { userId: teamMemberInfo3.user_id, isAdmin: teamMemberInfo3.is_admin }
            ];
            return verifyUsersAdminSettingsWithoutOrderAsync(teamMembersPromise, expectedUserAdminConfigurations);
        });
        it('should return all existing team members and not return other members', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team1, user2);
            var teamMemberInfo3 = createTeamMemberInfo(team2, user1);
            var teamMemberInfo4 = createTeamMemberInfo(team2, user3);
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo4)
            ]);
            var teamMembersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamInfo1.name); });
            var expectedUserInfo = [userInfo1, userInfo2];
            return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedUserInfo);
        });
    });
    describe('addTeamSkill', function () {
        it('should create a team skill', function () {
            var teamInfo = createTeamInfo('a');
            var skillInfo = createSkillInfo('skill1');
            var createTeamAndSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo)
            ]);
            var teamSkillPromise = createTeamAndSkillsPromise.then(function (teamAndSkill) {
                var team = teamAndSkill[0];
                var skill = teamAndSkill[1];
                var teamSkillInfo = createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            });
            return chai_1.expect(teamSkillPromise).to.eventually.fulfilled;
        });
    });
    describe('getTeamSkills', function () {
        function verifySkillsInfoWithoutOrderAsync(actualSkillsPromise, expectedSkillsInfo) {
            return chai_1.expect(actualSkillsPromise).to.eventually.fulfilled
                .then(function (skills) {
                var actualSkillInfo = _.map(skills, function (_) { return _.skill.attributes; });
                verifySkillsInfoWithoutOrder(actualSkillInfo, expectedSkillsInfo);
            });
        }
        function verifySkillsInfoWithoutOrder(actual, expected) {
            var actualOrdered = _.orderBy(actual, function (_) { return _.name; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.name; });
            chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
            for (var i = 0; i < expected.length; i++) {
                verifySkillInfo(actualOrdered[i], expectedOrdered[i]);
            }
        }
        function verifySkillInfo(actual, expected) {
            var actualCloned = _.clone(actual);
            var expectedCloned = _.clone(expected);
            delete actualCloned['id'];
            delete expectedCloned['id'];
            chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
        }
        function verifySkillsUpvotesWithoutOrderAsync(actualSkillsOfATeamPromise, expectedSkillIdToUpvotes) {
            return chai_1.expect(actualSkillsOfATeamPromise).to.eventually.fulfilled
                .then(function (actualSkills) {
                var orderedActualUsers = _.orderBy(actualSkills, function (_) { return _.skill.id; });
                var actualUpvotes = _.map(orderedActualUsers, function (_) { return _.upvotes; });
                var orderedExpectedUpvotes = _.orderBy(expectedSkillIdToUpvotes, function (_) { return _.skillId; });
                var expectedUpvotes = _.map(orderedExpectedUpvotes, function (_) { return _.upvotes; });
                chai_1.expect(actualUpvotes).to.deep.equal(expectedUpvotes);
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
        beforeEach(function () {
            skillInfo1 = createSkillInfo('skill1');
            skillInfo2 = createSkillInfo('skill2');
            skillInfo3 = createSkillInfo('skill3');
            teamInfo1 = createTeamInfo('a');
            teamInfo2 = createTeamInfo('b');
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]).then(function (teamsAndSkills) {
                team1 = teamsAndSkills[0];
                team2 = teamsAndSkills[1];
                skill1 = teamsAndSkills[2];
                skill2 = teamsAndSkills[3];
                skill3 = teamsAndSkills[4];
            });
        });
        it('not existing team should return empty', function () {
            var teamSkillsPromise = teamsDataHandler_1.TeamsDataHandler.getTeamSkills('not existing team');
            return chai_1.expect(teamSkillsPromise).to.eventually.deep.equal([]);
        });
        it('no team members should return empty', function () {
            var teamSkillsPromise = teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamInfo1.name);
            return chai_1.expect(teamSkillsPromise).to.eventually.deep.equal([]);
        });
        it('should return all existing team skills', function () {
            var teamSkillInfo1 = createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = createTeamSkillInfo(team1, skill2);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamInfo1.name); });
            var exxpectedSkillInfo = [skillInfo1, skillInfo2];
            return verifySkillsInfoWithoutOrderAsync(teamSkillsPromise, exxpectedSkillInfo);
        });
        it('should return all existing team skills with correct number of upvotes', function () {
            var teamSkillInfo1 = createTeamSkillInfo(team1, skill1);
            teamSkillInfo1.upvotes = 11;
            var teamSkillInfo2 = createTeamSkillInfo(team1, skill2);
            teamSkillInfo2.upvotes = 0;
            var teamSkillInfo3 = createTeamSkillInfo(team1, skill3);
            teamSkillInfo3.upvotes = 7;
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamInfo1.name); });
            var expectedSkillUpvotes = [
                { skillId: teamSkillInfo1.skill_id, upvotes: teamSkillInfo1.upvotes },
                { skillId: teamSkillInfo2.skill_id, upvotes: teamSkillInfo2.upvotes },
                { skillId: teamSkillInfo3.skill_id, upvotes: teamSkillInfo3.upvotes }
            ];
            return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
        });
        it('should return all existing skills and not return other skills', function () {
            var teamSkillInfo1 = createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = createTeamSkillInfo(team2, skill1);
            var teamSkillInfo4 = createTeamSkillInfo(team2, skill3);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo4)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamInfo1.name); });
            var expectedSkillsInfo = [skillInfo1, skillInfo2];
            return verifySkillsInfoWithoutOrderAsync(teamSkillsPromise, expectedSkillsInfo);
        });
    });
    describe('upvoteTeamSkill', function () {
        var teamInfo;
        var teamSkillInfo;
        var skillInfo;
        beforeEach(function () {
            teamInfo = createTeamInfo('team 1');
            skillInfo = createSkillInfo('skill 1');
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo)
            ]).then(function (teamAndSkill) {
                var team = teamAndSkill[0];
                var skill = teamAndSkill[1];
                teamSkillInfo = createTeamSkillInfo(team, skill);
                teamSkillInfo.upvotes = 10;
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            });
        });
        it('upvote with non existing team id should fail', function () {
            var teamId = teamSkillInfo.team_id + 1;
            var skillId = teamSkillInfo.skill_id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamId, skillId);
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote with non existing skill id should fail', function () {
            var teamId = teamSkillInfo.team_id;
            var skillId = teamSkillInfo.skill_id + 1;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamId, skillId);
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote should update the upvotes correctly', function () {
            var teamId = teamSkillInfo.team_id;
            var skillId = teamSkillInfo.skill_id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamId, skillId);
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(teamInfo.name); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotes).to.be.equal(teamSkillInfo.upvotes + 1);
            });
        });
    });
    describe('setAdminRights', function () {
        var teamInfo;
        var teamMemberInfo;
        var userInfo;
        beforeEach(function () {
            teamInfo = createTeamInfo('team 1');
            userInfo = createUserInfo(1);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo),
                userDataHandler_1.UserDataHandler.createUser(userInfo)
            ]).then(function (teamAndUser) {
                var team = teamAndUser[0];
                var user = teamAndUser[1];
                teamMemberInfo = createTeamMemberInfo(team, user);
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
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamInfo.name); })
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
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(teamInfo.name); })
                .then(function (usersOfATeam) {
                chai_1.expect(usersOfATeam.length).to.be.equal(1);
                chai_1.expect(usersOfATeam[0].isAdmin).to.be.false;
            });
        });
    });
});
