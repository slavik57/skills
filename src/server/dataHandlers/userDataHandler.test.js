"use strict";
var skillsDataHandler_1 = require("./skillsDataHandler");
var modelInfoVerificator_1 = require("../testUtils/modelInfoVerificator");
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoComparers_1 = require("../testUtils/modelInfoComparers");
var modelVerificator_1 = require("../testUtils/modelVerificator");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var globalPermission_1 = require("../models/enums/globalPermission");
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var userDataHandler_1 = require('./userDataHandler');
var usersGlobalPermissions_1 = require('../models/usersGlobalPermissions');
var teamMember_1 = require('../models/teamMember');
var teamsDataHandler_1 = require('./teamsDataHandler');
chai.use(chaiAsPromised);
describe('userDataHandler', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
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
    describe('createUser', function () {
        it('should create user correctly', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var userPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(userPromise, userInfo);
        });
    });
    describe('createUserWithPermissions', function () {
        it('should create user correctly', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var globalPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var userPromise = userDataHandler_1.UserDataHandler.createUserWithPermissions(userInfo, globalPermissions);
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(userPromise, userInfo);
        });
        it('should set the user permissions correctly', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var userPromise = userDataHandler_1.UserDataHandler.createUserWithPermissions(userInfo, expectedPermissions);
            return chai_1.expect(userPromise).to.eventually.fulfilled
                .then(function (_user) { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(_user.id); })
                .then(function (_actualPermissions) {
                chai_1.expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });
    });
    describe('deleteUser', function () {
        var testModels;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.fillAllTables()
                .then(function (_testModels) {
                testModels = _testModels;
            });
        });
        it('not existing user should not fail', function () {
            var promise = userDataHandler_1.UserDataHandler.deleteUser(9999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing user should not fail', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing user should remove the user', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
                .then(function (_users) {
                return _.map(_users, function (_) { return _.id; });
            })
                .then(function (_userIds) {
                chai_1.expect(_userIds).not.to.contain(userToDelete.id);
            });
        });
        it('existing user should remove the relevant user global permissions', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new usersGlobalPermissions_1.UsersGlobalPermissions().fetch(); })
                .then(function (_permissionsCollection) {
                return _permissionsCollection.toArray();
            })
                .then(function (_permissions) {
                return _.map(_permissions, function (_) { return _.attributes.user_id; });
            })
                .then(function (_userIds) {
                chai_1.expect(_userIds).not.to.contain(userToDelete.id);
            });
        });
        it('existing user should remove the relevant team members', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamMember_1.TeamMembers().fetch(); })
                .then(function (_teamMembersCollection) {
                return _teamMembersCollection.toArray();
            })
                .then(function (_teamMembers) {
                return _.map(_teamMembers, function (_) { return _.attributes.user_id; });
            })
                .then(function (_userIds) {
                chai_1.expect(_userIds).not.to.contain(userToDelete.id);
            });
        });
        it('existing user should remove the relevant team skill upvotes', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); })
                .then(function (_upvotesCollection) {
                return _upvotesCollection.toArray();
            })
                .then(function (_upvotes) {
                return _.map(_upvotes, function (_) { return _.attributes.user_id; });
            })
                .then(function (_userIds) {
                chai_1.expect(_userIds).not.to.contain(userToDelete.id);
            });
        });
        it('existing user should remove the relevant skill creators', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsCreators(); })
                .then(function (_skillsCreators) {
                return _.map(_skillsCreators, function (_) { return _.attributes.user_id; });
            })
                .then(function (_userIds) {
                chai_1.expect(_userIds).not.to.contain(userToDelete.id);
            });
        });
        it('existing user should remove the relevant team creators', function () {
            var userToDelete = testModels.users[0];
            var promise = userDataHandler_1.UserDataHandler.deleteUser(userToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamsCreators(); })
                .then(function (_teamsCreators) {
                return _.map(_teamsCreators, function (_) { return _.attributes.user_id; });
            })
                .then(function (_userIds) {
                chai_1.expect(_userIds).not.to.contain(userToDelete.id);
            });
        });
    });
    describe('getUser', function () {
        it('no such user should return null', function () {
            var userPromise = userDataHandler_1.UserDataHandler.getUser(99999);
            return chai_1.expect(userPromise).to.eventually.null;
        });
        it('user exists should return correct user', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var getUserPromise = createUserPromise.then(function (user) { return userDataHandler_1.UserDataHandler.getUser(user.id); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getUserPromise, userInfo);
        });
    });
    describe('getUserByUsername', function () {
        it('no such user should return null', function () {
            var userPromise = userDataHandler_1.UserDataHandler.getUserByUsername('not existing username');
            return chai_1.expect(userPromise).to.eventually.null;
        });
        it('user exists should return correct user', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var getUserPromise = createUserPromise.then(function (user) { return userDataHandler_1.UserDataHandler.getUserByUsername(userInfo.username); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getUserPromise, userInfo);
        });
    });
    describe('getUserByEmail', function () {
        it('no such user should return null', function () {
            var userPromise = userDataHandler_1.UserDataHandler.getUserByEmail('notExisting@email.com');
            return chai_1.expect(userPromise).to.eventually.null;
        });
        it('user exists should return correct user', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var getUserPromise = createUserPromise.then(function (user) { return userDataHandler_1.UserDataHandler.getUserByEmail(userInfo.email); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getUserPromise, userInfo);
        });
    });
    describe('getUsers', function () {
        it('no users should return empty', function () {
            var usersPromose = userDataHandler_1.UserDataHandler.getUsers();
            var expectedUsersInfo = [];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromose, expectedUsersInfo, modelInfoComparers_1.ModelInfoComparers.compareUserInfos);
        });
        it('should return all created users', function () {
            var userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            var userInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3);
            var createAllUsersPromise = Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo3)
            ]);
            var usersPromose = createAllUsersPromise.then(function () { return userDataHandler_1.UserDataHandler.getUsers(); });
            var expectedUsersInfo = [userInfo1, userInfo2, userInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromose, expectedUsersInfo, modelInfoComparers_1.ModelInfoComparers.compareUserInfos);
        });
    });
    describe('getUserGlobalPermissions', function () {
        it('no such user should return empty permissions list', function () {
            var permissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions(999999);
            var expectedPermissions = [];
            return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
        });
        it('user exists but has no permissions should return empty permissions list', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo);
            var permissionsPromise = createUserPromise.then(function (user) { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            var expectedPermissions = [];
            return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
        });
        it('user exists with permissions should return correct permissions list', function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var permissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var user;
            var createUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function (_user) {
                user = _user;
                return _user;
            });
            var addUserPermissionsPromise = createUserPromise.then(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions);
            });
            var permissionsPromise = addUserPermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions);
        });
        it('multiple users exist with permissions should return correct permissions list', function () {
            var userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
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
            var user1;
            var addUserPermissionsPromise1 = createUserPromise1.then(function (user) {
                user1 = user;
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions1);
            });
            var addUserPermissionsPromise2 = createUserPromise2.then(function (user) { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions2); });
            var permissionsPromise = Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
                .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user1.id); });
            return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions1);
        });
        it('multiple users exist with permissions should return correct permissions list 2', function () {
            var userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
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
            var addUserPermissionsPromise1 = createUserPromise1.then(function (user) { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions1); });
            var user2;
            var addUserPermissionsPromise2 = createUserPromise2.then(function (user) {
                user2 = user;
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions2);
            });
            var permissionsPromise = Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
                .then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user2.id); });
            return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions2);
        });
    });
    describe('getTeams', function () {
        function verifyTeamAdminSettingsAsync(actualUserTeamsPromise, expectedAdminSettings) {
            return chai_1.expect(actualUserTeamsPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var orderedActualTeams = _.orderBy(actualTeams, function (_) { return _.team.id; });
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
            teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            teamInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('c');
            userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ])
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1];
            })
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1, user1.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2, user1.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo3, user1.id)
            ]); }).then(function (_teams) {
                team1 = _teams[0], team2 = _teams[1], team3 = _teams[2];
            });
        });
        it('no such user should return empty teams list', function () {
            var teamsPromise = userDataHandler_1.UserDataHandler.getTeams(999999);
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('user exists but has no teams should return empty teams list', function () {
            var teamsPromise = userDataHandler_1.UserDataHandler.getTeams(user1.id);
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('user exists with teams should return correct teams', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
            var addTeamsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2)
            ]);
            var teamsPromise = addTeamsPromise.then(function () { return userDataHandler_1.UserDataHandler.getTeams(user1.id); })
                .then(function (teamsOfAUser) {
                return _.map(teamsOfAUser, function (_) { return _.team; });
            });
            var expectedTeams = [teamInfo1, teamInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise, expectedTeams, modelInfoComparers_1.ModelInfoComparers.compareTeamInfos);
        });
        it('user exists with teams should return correct admin settings', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            teamMemberInfo1.is_admin = true;
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
            teamMemberInfo2.is_admin = false;
            var teamMemberInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team3, user1);
            teamMemberInfo3.is_admin = true;
            var addTeamsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamsPromise = addTeamsPromise.then(function () { return userDataHandler_1.UserDataHandler.getTeams(user1.id); });
            var expectedTeamAdminSettings = [
                { teamId: teamMemberInfo1.team_id, isAdmin: teamMemberInfo1.is_admin },
                { teamId: teamMemberInfo2.team_id, isAdmin: teamMemberInfo2.is_admin },
                { teamId: teamMemberInfo3.team_id, isAdmin: teamMemberInfo3.is_admin }
            ];
            return verifyTeamAdminSettingsAsync(teamsPromise, expectedTeamAdminSettings);
        });
        it('multiple users exist with teams should return correct teams', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
            var teamMemberInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            var addTeamsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamsPromise = addTeamsPromise.then(function () { return userDataHandler_1.UserDataHandler.getTeams(user1.id); })
                .then(function (teamsOfAUser) {
                return _.map(teamsOfAUser, function (_) { return _.team; });
            });
            var expectedTeams = [teamInfo1, teamInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise, expectedTeams, modelInfoComparers_1.ModelInfoComparers.compareTeamInfos);
        });
    });
    describe('addGlobalPermissions', function () {
        var userInfo;
        var user;
        beforeEach(function () {
            userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            return userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function (_user) {
                user = _user;
            });
        });
        it('adding should add to permissions', function () {
            var permissionsToAdd = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var addPermissionPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd);
            var actualPermissionsPromise = addPermissionPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, permissionsToAdd);
        });
        it('adding permissions with same permission appearing multiple times should add only once', function () {
            var permissionsToAdd = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.READER
            ];
            var addPermissionPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd);
            var actualPermissionsPromise = addPermissionPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
        });
        it('adding same permissions should add to permissions only once', function () {
            var permissionsToAdd = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var addPermissionPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd)
                .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd); });
            var actualPermissionsPromise = addPermissionPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, permissionsToAdd);
        });
        it('adding existing permissions should succeed', function () {
            var permissionsToAdd = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var addPermissionPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd)
                .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd); });
            return chai_1.expect(addPermissionPromise).to.eventually.fulfilled;
        });
        it('adding to not existing user should fail', function () {
            var permissionsToAdd = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var addPermissionPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(999999, permissionsToAdd);
            return chai_1.expect(addPermissionPromise).to.eventually.rejected;
        });
        it('adding new permissions should add to permissions', function () {
            var existingPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
            var permissionsToAdd = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
            var addPermissionPromise = existingPermissionsPromise
                .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd); });
            var actualPermissionsPromise = addPermissionPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            var expectedPermissions = _.union(existingPermissions, permissionsToAdd);
            return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
        });
    });
    describe('removeGlobalPermissions', function () {
        var userInfo;
        var user;
        beforeEach(function () {
            userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            return userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function (_user) {
                user = _user;
            });
        });
        it('removing from user without permissions should succeed', function () {
            var permissionsToRemove = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var removePermissionsPromise = userDataHandler_1.UserDataHandler.removeGlobalPermissions(user.id, permissionsToRemove);
            return chai_1.expect(removePermissionsPromise).to.eventually.fulfilled;
        });
        it('removing all permissions should leave no permissions', function () {
            var existingPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
            var removePermissionsPromise = existingPermissionsPromise
                .then(function () { return userDataHandler_1.UserDataHandler.removeGlobalPermissions(user.id, existingPermissions); });
            var actualPermissionsPromise = removePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            return chai_1.expect(actualPermissionsPromise).to.eventually.deep.equal([]);
        });
        it('removing some permissions should leave other permissions', function () {
            var existingPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.GUEST
            ];
            var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
            var permissionsToRemove = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
            var removePermissionsPromise = existingPermissionsPromise
                .then(function () { return userDataHandler_1.UserDataHandler.removeGlobalPermissions(user.id, permissionsToRemove); });
            var actualPermissionsPromise = removePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.GUEST
            ];
            return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
        });
        it('removing permissions that appear multiple times should remove correctly', function () {
            var existingPermissions = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.GUEST
            ];
            var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
            var permissionsToRemove = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
            var removePermissionsPromise = existingPermissionsPromise
                .then(function () { return userDataHandler_1.UserDataHandler.removeGlobalPermissions(user.id, permissionsToRemove); });
            var actualPermissionsPromise = removePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
            var expectedPermissions = [
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.GUEST
            ];
            return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
        });
        it('removing from not existing user should not fail', function () {
            var permissionsToRemove = [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
            var addPermissionPromise = userDataHandler_1.UserDataHandler.removeGlobalPermissions(999999, permissionsToRemove);
            return chai_1.expect(addPermissionPromise).to.eventually.fulfilled;
        });
    });
    describe('updateGlobalPermissions', function () {
        var userInfo;
        var user;
        beforeEach(function () {
            userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            return userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function (_user) {
                user = _user;
            });
        });
        describe('add', function () {
            it('adding should add to permissions', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, permissionsToAdd, []);
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, permissionsToAdd);
            });
            it('adding permissions with same permission appearing multiple times should add only once', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, permissionsToAdd, []);
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                var expectedPermissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
            });
            it('adding same permissions should add to permissions only once', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd)
                    .then(function () { return userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, permissionsToAdd, []); });
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, permissionsToAdd);
            });
            it('adding existing permissions should succeed', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd)
                    .then(function () { return userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, permissionsToAdd, []); });
                return chai_1.expect(updatePermissionsPromise).to.eventually.fulfilled;
            });
            it('adding to not existing user should fail', function () {
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.updateGlobalPermissions(999999, permissionsToAdd, []);
                return chai_1.expect(updatePermissionsPromise).to.eventually.rejected;
            });
            it('adding new permissions should add to permissions', function () {
                var existingPermissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var existingPermissionsPromise = userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, existingPermissions, []);
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var updatePermissionsPromise = existingPermissionsPromise
                    .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd); });
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                var expectedPermissions = _.union(existingPermissions, permissionsToAdd);
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
            });
        });
        describe('remove', function () {
            it('removing from user without permissions should succeed', function () {
                var permissionsToRemove = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, [], permissionsToRemove);
                return chai_1.expect(updatePermissionsPromise).to.eventually.fulfilled;
            });
            it('removing all permissions should leave no permissions', function () {
                var existingPermissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
                var updatePermissionsPromise = existingPermissionsPromise
                    .then(function () { return userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, [], existingPermissions); });
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                return chai_1.expect(actualPermissionsPromise).to.eventually.deep.equal([]);
            });
            it('removing some permissions should leave other permissions', function () {
                var existingPermissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
                var permissionsToRemove = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var updatePermissionsPromise = existingPermissionsPromise
                    .then(function () { return userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, [], permissionsToRemove); });
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                var expectedPermissions = [
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
            });
            it('removing permissions that appear multiple times should remove correctly', function () {
                var existingPermissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
                var permissionsToRemove = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var updatePermissionsPromise = existingPermissionsPromise
                    .then(function () { return userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, [], permissionsToRemove); });
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                var expectedPermissions = [
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
            });
            it('removing from not existing user should fail', function () {
                var permissionsToRemove = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                var updatePermissionsPromise = userDataHandler_1.UserDataHandler.updateGlobalPermissions(999999, [], permissionsToRemove);
                return chai_1.expect(updatePermissionsPromise).to.eventually.rejected;
            });
        });
        describe('add with remove', function () {
            it('add and remove with same permissions should set permissions correctly', function () {
                var existingPermissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                ];
                var existingPermissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, existingPermissions);
                var permissionsToAdd = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                var permissionsToRemove = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                var updatePermissionsPromise = existingPermissionsPromise
                    .then(function () { return userDataHandler_1.UserDataHandler.updateGlobalPermissions(user.id, permissionsToAdd, permissionsToRemove); });
                var actualPermissionsPromise = updatePermissionsPromise.then(function () { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(user.id); });
                var expectedPermissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                ];
                return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
            });
        });
    });
    describe('updateUserDetails', function () {
        it('should update the user details correctly', function () {
            var user;
            var newUserInfo;
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
                newUserInfo = {
                    id: user.id,
                    username: user.attributes.username + ' new username',
                    password_hash: user.attributes.password_hash,
                    email: 'newMail' + user.attributes.email,
                    firstName: user.attributes.firstName + ' new first name',
                    lastName: user.attributes.lastName + ' new last name'
                };
            });
            var updateUserDetailsPromise = createUserPromise.then(function () {
                return userDataHandler_1.UserDataHandler.updateUserDetails(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
            });
            return chai_1.expect(updateUserDetailsPromise).to.eventually.fulfilled
                .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                .then(function (_user) {
                modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_user.attributes, newUserInfo);
            });
        });
        it('with undefined email should update the user details correctly', function () {
            var user;
            var newUserInfo;
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
                newUserInfo = {
                    id: user.id,
                    username: user.attributes.username + ' new username',
                    password_hash: user.attributes.password_hash,
                    email: undefined,
                    firstName: user.attributes.firstName + ' new first name',
                    lastName: user.attributes.lastName + ' new last name'
                };
            });
            var updateUserDetailsPromise = createUserPromise.then(function () {
                return userDataHandler_1.UserDataHandler.updateUserDetails(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
            });
            return chai_1.expect(updateUserDetailsPromise).to.eventually.fulfilled
                .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                .then(function (_user) {
                newUserInfo.email = null;
                modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_user.attributes, newUserInfo);
            });
        });
    });
    describe('updateUserPassword', function () {
        it('should update the user password correctly', function () {
            var newPasswordHash;
            var expectedUserInfo;
            var user;
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
                newPasswordHash = 'new ' + user.attributes.password_hash;
                expectedUserInfo = {
                    username: user.attributes.username,
                    password_hash: newPasswordHash,
                    email: user.attributes.email,
                    firstName: user.attributes.firstName,
                    lastName: user.attributes.lastName
                };
            });
            var updateUserPasswordPromise = createUserPromise.then(function () {
                return userDataHandler_1.UserDataHandler.updateUserPassword(user.id, newPasswordHash);
            });
            return chai_1.expect(updateUserPasswordPromise).to.eventually.fulfilled
                .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                .then(function (_user) {
                modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_user.attributes, expectedUserInfo);
            });
        });
    });
    describe('getUsersByPartialUsername', function () {
        var singlePartialUsername;
        var multiplePartialUsername;
        var multiplePartialUsernameWithUnderscore;
        var multiplePartialUsernameWithPercentage;
        var userInfos;
        beforeEach(function () {
            singlePartialUsername = '_a_';
            multiplePartialUsername = '-b-';
            multiplePartialUsernameWithUnderscore = '_c_';
            multiplePartialUsernameWithPercentage = '%d%';
            userInfos = [
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1),
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2),
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3),
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(4),
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(5),
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(6),
                modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(7)
            ];
            userInfos[0].username = 'username' + singlePartialUsername + 'username';
            userInfos[1].username = 'username' + multiplePartialUsername + 'username1';
            userInfos[2].username = 'username' + multiplePartialUsername + 'username2';
            userInfos[3].username = 'username' + multiplePartialUsernameWithUnderscore + 'username1';
            userInfos[4].username = 'username' + multiplePartialUsernameWithUnderscore + 'username2';
            userInfos[5].username = 'username' + multiplePartialUsernameWithPercentage + 'username1';
            userInfos[6].username = 'username' + multiplePartialUsernameWithPercentage + 'username2';
            return environmentCleaner_1.EnvironmentCleaner.clearTables()
                .then(function () { return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfos[0]),
                userDataHandler_1.UserDataHandler.createUser(userInfos[1]),
                userDataHandler_1.UserDataHandler.createUser(userInfos[2]),
                userDataHandler_1.UserDataHandler.createUser(userInfos[3]),
                userDataHandler_1.UserDataHandler.createUser(userInfos[4]),
                userDataHandler_1.UserDataHandler.createUser(userInfos[5]),
                userDataHandler_1.UserDataHandler.createUser(userInfos[6]),
            ]); });
        });
        function verifyUsersContainThePartialUsername(users, partialUsername) {
            var usernames = _.map(users, function (_) { return _.attributes.username; });
            usernames.forEach(function (_username) {
                chai_1.expect(_username).to.contain(partialUsername);
            });
        }
        it('no username with given partial username should return empty', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername('not existing');
            return chai_1.expect(result).to.eventually.deep.equal([]);
        });
        it('one username with given partial username should return the user', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(singlePartialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(1, 'should contain atleast one user');
                verifyUsersContainThePartialUsername(_users, singlePartialUsername);
            });
        });
        it('multiple usernames with given partial username should return the users', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsername);
            });
        });
        it('multiple usernames with given partial username with _ should return the users', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsernameWithUnderscore);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithUnderscore);
            });
        });
        it('multiple usernames with given partial username with % should return the users', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsernameWithPercentage);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithPercentage);
            });
        });
        it('limited to 0, multiple usernames with given partial username should return no users', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsername, 0);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(0);
            });
        });
        it('limited to 0, multiple usernames with given partial username with _ should return no users', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsernameWithUnderscore, 0);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(0);
            });
        });
        it('limited to 0, multiple usernames with given partial username with % should return no users', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsernameWithPercentage, 0);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(0);
            });
        });
        it('limited to 1, multiple usernames with given partial username should return one user', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsername, 1);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(1);
                verifyUsersContainThePartialUsername(_users, multiplePartialUsername);
            });
        });
        it('limited to 1, multiple usernames with given partial username with _ should return one user', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsernameWithUnderscore, 1);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(1);
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithUnderscore);
            });
        });
        it('limited to 1, multiple usernames with given partial username with % should return one user', function () {
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(multiplePartialUsernameWithPercentage, 1);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users).to.be.length(1);
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithPercentage);
            });
        });
        it('multiple usernames with given partial upper case username should return the users', function () {
            var partialUsername = multiplePartialUsername.toUpperCase();
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(partialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length, 'should contain atleast 2 users').to.be.at.least(2);
                verifyUsersContainThePartialUsername(_users, multiplePartialUsername);
            });
        });
        it('multiple usernames with given partial upper case username with _ should return the users', function () {
            var partialUsername = multiplePartialUsernameWithUnderscore.toUpperCase();
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(partialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithUnderscore);
            });
        });
        it('multiple usernames with given partial upper case username with % should return the users', function () {
            var partialUsername = multiplePartialUsernameWithPercentage.toUpperCase();
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(partialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithPercentage);
            });
        });
        it('multiple usernames with given partial lower case username should return the users', function () {
            var partialUsername = multiplePartialUsername.toLowerCase();
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(partialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsername);
            });
        });
        it('multiple usernames with given partial lower case username with _ should return the users', function () {
            var partialUsername = multiplePartialUsernameWithUnderscore.toLowerCase();
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(partialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithUnderscore);
            });
        });
        it('multiple usernames with given partial lower case username with % should return the users', function () {
            var partialUsername = multiplePartialUsernameWithPercentage.toLowerCase();
            var result = userDataHandler_1.UserDataHandler.getUsersByPartialUsername(partialUsername);
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_users) {
                chai_1.expect(_users.length > 1, 'should contain atleast 2 users').to.be.true;
                verifyUsersContainThePartialUsername(_users, multiplePartialUsernameWithPercentage);
            });
        });
    });
});
//# sourceMappingURL=userDataHandler.test.js.map