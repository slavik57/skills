"use strict";
var chai_1 = require('chai');
var _ = require('lodash');
var user_1 = require('../models/user');
var userDataHandler_1 = require('./userDataHandler');
var usersGlobalPermissions_1 = require('../models/usersGlobalPermissions');
describe('userDataHandler', function () {
    beforeEach(function () {
        return usersGlobalPermissions_1.UsersGlobalPermissions.clearAll()
            .then(function () { return user_1.Users.clearAll(); });
    });
    afterEach(function () {
        return usersGlobalPermissions_1.UsersGlobalPermissions.clearAll()
            .then(function () { return user_1.Users.clearAll(); });
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
                    global_permissions: usersGlobalPermissions_1.GlobalPermission[permission]
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
                usersGlobalPermissions_1.GlobalPermission.ADMIN,
                usersGlobalPermissions_1.GlobalPermission.TEAMS_LIST_ADMIN,
                usersGlobalPermissions_1.GlobalPermission.SKILLS_LIST_ADMIN
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
                usersGlobalPermissions_1.GlobalPermission.READER,
                usersGlobalPermissions_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var permissions2 = [
                usersGlobalPermissions_1.GlobalPermission.ADMIN,
                usersGlobalPermissions_1.GlobalPermission.TEAMS_LIST_ADMIN,
                usersGlobalPermissions_1.GlobalPermission.SKILLS_LIST_ADMIN
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
                usersGlobalPermissions_1.GlobalPermission.READER,
                usersGlobalPermissions_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var permissions2 = [
                usersGlobalPermissions_1.GlobalPermission.ADMIN,
                usersGlobalPermissions_1.GlobalPermission.TEAMS_LIST_ADMIN,
                usersGlobalPermissions_1.GlobalPermission.SKILLS_LIST_ADMIN
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
});
