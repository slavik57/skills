"use strict";
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var team_1 = require('../models/team');
var teamMember_1 = require('../models/teamMember');
var user_1 = require('../models/user');
var teamsDataHandler_1 = require('./teamsDataHandler');
var userDataHandler_1 = require('./userDataHandler');
chai.use(chaiAsPromised);
describe('TeamsDataHandler', function () {
    function clearTables() {
        return teamMember_1.TeamMembers.clearAll()
            .then(function () { return Promise.all([
            team_1.Teams.clearAll(),
            user_1.Users.clearAll()
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
        it('should return all existing skill prerequisites and not return other prerequisites', function () {
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
});
