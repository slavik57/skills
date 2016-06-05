"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var user_1 = require('../models/user');
var userDataHandler_1 = require('./userDataHandler');
var usersGlobalPermissions_1 = require('../models/usersGlobalPermissions');
var team_1 = require('../models/team');
var teamMember_1 = require('../models/teamMember');
var teamsDataHandler_1 = require('./teamsDataHandler');
chai.use(chaiAsPromised);
describe('userDataHandler', function () {
    function clearTables() {
        return Promise.all([
            usersGlobalPermissions_1.UsersGlobalPermissions.clearAll(),
            teamMember_1.TeamMembers.clearAll()
        ]).then(function () {
            return Promise.all([
                user_1.Users.clearAll(),
                team_1.Teams.clearAll()
            ]);
        });
    }
    beforeEach(function () {
        return clearTables();
    });
    afterEach(function () {
        return clearTables();
    });
    function createUserInfo(userNumber) {
        var userNumberString = userNumber.toString();
        return {
            username: userNumberString + ' name',
            password_hash: userNumberString + ' password',
            email: userNumberString + '@gmail.com',
            firstName: userNumberString + ' first name',
            lastName: userNumberString + ' last name'
        };
    }
    function verifyUserInfoAsync(actualUserPromise, expectedUserInfo) {
        return chai_1.expect(actualUserPromise).to.eventually.fulfilled
            .then(function (user) {
            verifyUserInfo(user.attributes, expectedUserInfo);
        });
    }
    function verifyUserInfo(actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned['id'];
        delete expectedCloned['id'];
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    }
    describe('createUser', function () {
        it('should create user correctly', function () {
            var userInfo = createUserInfo(1);
            var userPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            return verifyUserInfoAsync(userPromise, userInfo);
        });
    });
    describe('getUser', function () {
        it('no such user should return null', function () {
            var userPromise = userDataHandler_1.UserDataHandler.getUser('not existing user');
            return chai_1.expect(userPromise).to.eventually.null;
        });
        it('user exists should return correct user', function () {
            var userInfo = createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var getUserPromise = createUserPromise.then(function () { return userDataHandler_1.UserDataHandler.getUser(userInfo.username); });
            return verifyUserInfoAsync(getUserPromise, userInfo);
        });
    });
    describe('getUsers', function () {
        function verifyUsersInfoWithoutOrderAsync(actualUsersPromise, expectedUsersInfo) {
            return chai_1.expect(actualUsersPromise).to.eventually.fulfilled
                .then(function (users) {
                var actualUserInfos = _.map(users, function (_user) { return _user.attributes; });
                verifyUsersInfoWithoutOrder(actualUserInfos, expectedUsersInfo);
            });
        }
        function verifyUsersInfoWithoutOrder(actual, expected) {
            var actualOrdered = _.orderBy(actual, function (_info) { return _info.username; });
            var expectedOrdered = _.orderBy(expected, function (_info) { return _info.username; });
            chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
            for (var i = 0; i < expected.length; i++) {
                verifyUserInfo(actualOrdered[i], expectedOrdered[i]);
            }
        }
        it('no users should return empty', function () {
            var usersPromose = userDataHandler_1.UserDataHandler.getUsers();
            var expectedUsersInfo = [];
            return verifyUsersInfoWithoutOrderAsync(usersPromose, expectedUsersInfo);
        });
        it('should return all created users', function () {
            var userInfo1 = createUserInfo(1);
            var userInfo2 = createUserInfo(2);
            var userInfo3 = createUserInfo(3);
            var createAllUsersPromise = Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo3)
            ]);
            var usersPromose = createAllUsersPromise.then(function () { return userDataHandler_1.UserDataHandler.getUsers(); });
            var expectedUsersInfo = [userInfo1, userInfo2, userInfo3];
            return verifyUsersInfoWithoutOrderAsync(usersPromose, expectedUsersInfo);
        });
    });
    describe('getUserByUsername', function () {
        it('no such user and require is false should succeed with null', function () {
            var userPromise = userDataHandler_1.UserDataHandler.getUserByUsername('not existing', false);
            return chai_1.expect(userPromise).to.eventually.be.null;
        });
        it('no such user and require is true should fail', function () {
            var userPromise = userDataHandler_1.UserDataHandler.getUserByUsername('not existing', true);
            return chai_1.expect(userPromise).to.eventually.rejected;
        });
        it('user exists and require is false should return correct user', function () {
            var userInfo1 = createUserInfo(1);
            var userInfo2 = createUserInfo(2);
            var userInfo3 = createUserInfo(3);
            var createUsersPromise = Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo3)
            ]);
            var userPromise = createUsersPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userInfo2.username, false); });
            return verifyUserInfoAsync(userPromise, userInfo2);
        });
        it('user exists and require is true should return correct user', function () {
            var userInfo1 = createUserInfo(1);
            var userInfo2 = createUserInfo(2);
            var userInfo3 = createUserInfo(3);
            var createUsersPromise = Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo3)
            ]);
            var userPromise = createUsersPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userInfo2.username, true); });
            return verifyUserInfoAsync(userPromise, userInfo2);
        });
    });
    describe('getUserGlobalPermissions', function () {
        function verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions) {
            return chai_1.expect(actualPermissionsPromise).to.eventually.fulfilled
                .then(function (actualPermissions) {
                verifyUserGlobalPermissions(actualPermissions, expectedPermissions);
            });
        }
        function verifyUserGlobalPermissions(actual, expected) {
            var actualOrdered = actual.sort();
            var expectedOrdered = expected.sort();
            chai_1.expect(actualOrdered).to.deep.equal(expectedOrdered);
        }
        function addUserPermissions(user, permissions) {
            var permissionPromises = [];
            permissions.forEach(function (permission) {
                var newPermission = {
                    user_id: user.id,
                    global_permissions: globalPermission_1.GlobalPermission[permission]
                };
                var newPermissionPromise = new usersGlobalPermissions_1.UserGlobalPermissions(newPermission).save();
                permissionPromises.push(newPermissionPromise);
            });
            return Promise.all(permissionPromises);
        }
        it('no such user should return empty permissions list', function () {
            var permissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions('not existing username');
            var expectedPermissions = [];
            return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
        });
        it('user exists but has no permissions should return empty permissions list', function () {
            var userInfo = createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var permissionsPromise = createUserPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userInfo.username); });
            var expectedPermissions = [];
            return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
        });
        it('user exists with permissions should return correct permissions list', function () {
            var userInfo = createUserInfo(1);
            var permissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var addUserPermissionsPromise = createUserPromise.then(function (user) { return addUserPermissions(user, permissions); });
            var permissionsPromise = createUserPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userInfo.username); });
            return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions);
        });
        it('multiple users exist with permissions should return correct permissions list', function () {
            var userInfo1 = createUserInfo(1);
            var userInfo2 = createUserInfo(2);
            var permissions1 = [
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var permissions2 = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var createUserPromise1 = userDataHandler_1.UserDataHandler.createUser(userInfo1);
            var createUserPromise2 = userDataHandler_1.UserDataHandler.createUser(userInfo2);
            var addUserPermissionsPromise1 = createUserPromise1.then(function (user) { return addUserPermissions(user, permissions1); });
            var addUserPermissionsPromise2 = createUserPromise2.then(function (user) { return addUserPermissions(user, permissions2); });
            var permissionsPromise = Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
                .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userInfo1.username); });
            return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions1);
        });
        it('multiple users exist with permissions should return correct permissions list 2', function () {
            var userInfo1 = createUserInfo(1);
            var userInfo2 = createUserInfo(2);
            var permissions1 = [
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var permissions2 = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var createUserPromise1 = userDataHandler_1.UserDataHandler.createUser(userInfo1);
            var createUserPromise2 = userDataHandler_1.UserDataHandler.createUser(userInfo2);
            var addUserPermissionsPromise1 = createUserPromise1.then(function (user) { return addUserPermissions(user, permissions1); });
            var addUserPermissionsPromise2 = createUserPromise2.then(function (user) { return addUserPermissions(user, permissions2); });
            var permissionsPromise = Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
                .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userInfo2.username); });
            return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions2);
        });
    });
    describe('getTeams', function () {
        function verifyTeamsAsync(actualTeamsPromise, expectedTeams) {
            return chai_1.expect(actualTeamsPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var actualTeamInfos = _.map(actualTeams, function (_) { return _.team.attributes; });
                verifyTeams(actualTeamInfos, expectedTeams);
            });
        }
        function verifyTeams(actual, expected) {
            var actualOrdered = _.orderBy(actual, function (_) { return _.name; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.name; });
            chai_1.expect(actual.length).to.be.equal(expected.length);
            for (var i = 0; i < expected.length; i++) {
                verifyTeam(actualOrdered[i], expectedOrdered[i]);
            }
        }
        function verifyTeam(actual, expected) {
            var actualCloned = _.clone(actual);
            var expectedCloned = _.clone(expected);
            delete actualCloned['id'];
            delete expectedCloned['id'];
            chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
        }
        function createTeamInfo(teamName) {
            return {
                name: teamName
            };
        }
        function createTeamMemberInfo(team, user) {
            return {
                team_id: team.id,
                user_id: user.id,
                is_admin: false
            };
        }
        function verifyTeamAdminSettingsAsync(actualUserTeamsPromise, expectedAdminSettings) {
            return chai_1.expect(actualUserTeamsPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var orderedActualTeams = _.orderBy(actualTeams, function (_) { return _.team.attributes.name; });
                var actualIsAdmin = _.map(orderedActualTeams, function (_) { return _.isAdmin; });
                var orderedExpectedAdminSettings = _.orderBy(expectedAdminSettings, function (_) { return _.teamId; });
                var expectedIsAdmin = _.map(orderedExpectedAdminSettings, function (_) { return _.isAdmin; });
                chai_1.expect(actualIsAdmin).to.deep.equal(expectedIsAdmin);
            });
        }
        var teamInfo1;
        var teamInfo2;
        var teamInfo3;
        var userInfo1;
        var userInfo2;
        var team1;
        var team2;
        var team3;
        var user1;
        var user2;
        beforeEach(function () {
            teamInfo1 = createTeamInfo('a');
            teamInfo2 = createTeamInfo('b');
            teamInfo3 = createTeamInfo('c');
            userInfo1 = createUserInfo(1);
            userInfo2 = createUserInfo(2);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo3),
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ]).then(function (teamsAndUser) {
                team1 = teamsAndUser[0];
                team2 = teamsAndUser[1];
                team3 = teamsAndUser[2];
                user1 = teamsAndUser[3];
                user2 = teamsAndUser[4];
            });
        });
        it('no such user should return empty teams list', function () {
            var teamsPromise = userDataHandler_1.UserDataHandler.getTeams('not existing username');
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('user exists but has no teams should return empty teams list', function () {
            var teamsPromise = userDataHandler_1.UserDataHandler.getTeams(userInfo1.username);
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('user exists with teams should return correct teams', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team2, user1);
            var addTeamsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2)
            ]);
            var teamsPromise = addTeamsPromise.then(function () { return userDataHandler_1.UserDataHandler.getTeams(userInfo1.username); });
            var expectedTeams = [teamInfo1, teamInfo2];
            return verifyTeamsAsync(teamsPromise, expectedTeams);
        });
        it('user exists with teams should return correct admin settings', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            teamMemberInfo1.is_admin = true;
            var teamMemberInfo2 = createTeamMemberInfo(team2, user1);
            teamMemberInfo2.is_admin = false;
            var teamMemberInfo3 = createTeamMemberInfo(team3, user1);
            teamMemberInfo3.is_admin = true;
            var addTeamsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamsPromise = addTeamsPromise.then(function () { return userDataHandler_1.UserDataHandler.getTeams(userInfo1.username); });
            var expectedTeamAdminSettings = [
                { teamId: teamMemberInfo1.team_id, isAdmin: teamMemberInfo1.is_admin },
                { teamId: teamMemberInfo2.team_id, isAdmin: teamMemberInfo2.is_admin },
                { teamId: teamMemberInfo3.team_id, isAdmin: teamMemberInfo3.is_admin }
            ];
            return verifyTeamAdminSettingsAsync(teamsPromise, expectedTeamAdminSettings);
        });
        it('multiple users exist with teams should return correct teams', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team2, user1);
            var teamMemberInfo3 = createTeamMemberInfo(team1, user2);
            var addTeamsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamsPromise = addTeamsPromise.then(function () { return userDataHandler_1.UserDataHandler.getTeams(userInfo1.username); });
            var expectedTeams = [teamInfo1, teamInfo2];
            return verifyTeamsAsync(teamsPromise, expectedTeams);
        });
    });
});
