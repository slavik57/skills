"use strict";
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var globalPermissionConverter_1 = require("../enums/globalPermissionConverter");
var globalPermission_1 = require("../models/enums/globalPermission");
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var userLoginManager_1 = require("../testUtils/userLoginManager");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var chai_1 = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
var testConfigurations_1 = require('../../../testConfigurations');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('usersController', function () {
    var expressServer;
    var server;
    var userDefinition;
    var users;
    var usernameSuffix;
    before(function (done) {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        expressServer_1.ExpressServer.instance.initialize()
            .then(function (_expressServer) {
            expressServer = _expressServer;
            server = supertest.agent(expressServer.expressApp);
            done();
        });
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        userDefinition = {
            username: 'someUser',
            password: 'somePassword',
            email: 'a@gmail.com',
            firstName: 'first name',
            lastName: 'last name'
        };
        return userLoginManager_1.UserLoginManager.logoutUser(server);
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        usernameSuffix = '_usersController';
        return environmentDirtifier_1.EnvironmentDirtifier.createUsers(5, usernameSuffix)
            .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
            .then(function (_users) {
            users = _users;
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getExpectedUsersDetails(users) {
        return _.map(users, function (_user) {
            return {
                id: _user.id,
                username: _user.attributes.username
            };
        });
    }
    var notAuthorizedTests = function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('getting users details should fail', function (done) {
            server.get('/users')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        describe('get filtered users details by partial username', function () {
            it('should fail', function (done) {
                server.get('/users/filtered/1')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('with maximum number of users should fail', function (done) {
                server.get('/users/filtered/1?max=12')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
        it('checking if not existing user exists should return false', function (done) {
            server.get('/users/notExistingUser/exists')
                .expect(statusCode_1.StatusCode.OK)
                .expect({ userExists: false })
                .end(done);
        });
        it('checking if existing user exists should return true', function (done) {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(123);
            userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function () {
                server.get('/users/' + userInfo.username + '/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: true })
                    .end(done);
            });
        });
        it('updating user permissions should fail', function (done) {
            server.put('/users/1/permissions')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        describe('get user permissions', function () {
            var user;
            beforeEach(function () {
                var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(42);
                return userDataHandler_1.UserDataHandler.createUser(userInfo)
                    .then(function (_user) {
                    user = _user;
                });
            });
            afterEach(function () {
                return environmentCleaner_1.EnvironmentCleaner.clearTables();
            });
            it('getting not existing user permissions should fail', function (done) {
                server.get('/users/123456/permissions')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('getting existing user permissions should fail', function (done) {
                server.get('/users/' + user.id + '/permissions')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    };
    var autorizedTests = function (signinUserMethod) {
        return function () {
            var user;
            beforeEach(function () {
                return signinUserMethod()
                    .then(function (_user) {
                    user = _user;
                });
            });
            it('getting users details should succeed', function (done) {
                var expectedUsers = getExpectedUsersDetails(users).sort(function (_1, _2) { return _1.id - _2.id; });
                server.get('/users')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(expectedUsers)
                    .end(done);
            });
            describe('gett filtered users details by partial username', function () {
                it('should return one user', function (done) {
                    var usersWith1 = _.filter(users, function (_) { return _.attributes.username.indexOf('1') >= 0; });
                    var expectedUsers = getExpectedUsersDetails(usersWith1);
                    chai_1.expect(expectedUsers.length > 0).to.be.true;
                    server.get('/users/filtered/1')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedUsers)
                        .end(done);
                });
                it('should return all users', function (done) {
                    var usersWithUsername = _.filter(users, function (_) { return _.attributes.username.indexOf('username') >= 0; });
                    var expectedUsers = getExpectedUsersDetails(usersWithUsername);
                    chai_1.expect(expectedUsers.length > 0).to.be.true;
                    server.get('/users/filtered/username')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedUsers)
                        .end(done);
                });
                it('with max number of users limit should return one user', function (done) {
                    var usersWith1 = _.filter(users, function (_) { return _.attributes.username.indexOf('name1') >= 0; });
                    var expectedUsers = getExpectedUsersDetails(usersWith1);
                    chai_1.expect(expectedUsers.length).to.be.equal(1);
                    server.get('/users/filtered/1?max=12')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedUsers)
                        .end(done);
                });
                it('with max number of users limit should return correct number of users', function (done) {
                    var allRelevantUsers = _.filter(users, function (_) { return _.attributes.username.indexOf(usernameSuffix) >= 0; });
                    var allUsers = getExpectedUsersDetails(allRelevantUsers);
                    var maxNumberOfUsers = 2;
                    chai_1.expect(allUsers.length).to.be.greaterThan(maxNumberOfUsers);
                    server.get('/users/filtered/' + usernameSuffix + '?max=' + maxNumberOfUsers)
                        .expect(statusCode_1.StatusCode.OK)
                        .end(function (error, response) {
                        var actualUsers = response.body;
                        chai_1.expect(actualUsers).to.be.length(maxNumberOfUsers);
                        actualUsers.forEach(function (_user) {
                            chai_1.expect(_user.username).to.contain(usernameSuffix);
                        });
                        done();
                    });
                });
            });
            it('checking if not existing user exists should return false', function (done) {
                server.get('/users/notExistingUser/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: false })
                    .end(done);
            });
            it('checking if existing user exists should return true', function (done) {
                server.get('/users/' + userDefinition.username + '/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: true })
                    .end(done);
            });
            describe('get user permissions', function () {
                var user;
                var permissions;
                var expectedPermissions;
                beforeEach(function () {
                    permissions = [
                        globalPermission_1.GlobalPermission.ADMIN,
                        globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                        globalPermission_1.GlobalPermission.READER,
                        globalPermission_1.GlobalPermission.GUEST
                    ];
                    var permissionsWithoutGuest = _.difference(permissions, [globalPermission_1.GlobalPermission.GUEST]);
                    expectedPermissions =
                        _.map(permissionsWithoutGuest, function (_) { return globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_); })
                            .sort(function (_1, _2) { return _1.value - _2.value; });
                    var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(213);
                    return userDataHandler_1.UserDataHandler.createUser(userInfo)
                        .then(function (_user) {
                        user = _user;
                    })
                        .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions); });
                });
                it('getting not existing user permissions should succeed with empty permissions', function (done) {
                    server.get('/users/123456/permissions')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect([])
                        .end(done);
                });
                it('getting existing user permissions should succeed', function (done) {
                    server.get('/users/' + user.id + '/permissions')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedPermissions)
                        .end(done);
                });
            });
            describe('update user permissions', function () {
                var userToModifyPermissionsOf;
                var permissionsOfUserToModify;
                beforeEach(function () {
                    permissionsOfUserToModify = [
                        globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                    ];
                    var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(334);
                    return userDataHandler_1.UserDataHandler.createUser(userInfo)
                        .then(function (_user) {
                        userToModifyPermissionsOf = _user;
                    })
                        .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(userToModifyPermissionsOf.id, permissionsOfUserToModify); });
                });
                describe('logged in user has insuffisient permissions to modify the user', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.READER]);
                    });
                    it('removing permissions should fail', function (done) {
                        var userPermissions = {
                            permissionsToAdd: [],
                            permissionsToRemove: permissionsOfUserToModify
                        };
                        server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                            .end(done);
                    });
                    it('adding permissions should fail', function (done) {
                        var userPermissions = {
                            permissionsToAdd: [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN],
                            permissionsToRemove: []
                        };
                        server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                            .end(done);
                    });
                });
                describe('logged in user has suffisient permissions to modify the user', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    it('removing permissions should succeed', function (done) {
                        var userPermissions = {
                            permissionsToAdd: [],
                            permissionsToRemove: permissionsOfUserToModify
                        };
                        server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(function () {
                            userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                                .then(function (_actualPermissions) {
                                permissionsOfUserToModify.forEach(function (_permission) {
                                    chai_1.expect(_actualPermissions).to.not.contain(_permission);
                                });
                                done();
                            });
                        });
                    });
                    it('adding permissions should succeed', function (done) {
                        var userPermissions = {
                            permissionsToAdd: [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN],
                            permissionsToRemove: []
                        };
                        server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(function () {
                            userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                                .then(function (_actualPermissions) {
                                chai_1.expect(_actualPermissions).to.contain(globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN);
                                done();
                            });
                        });
                    });
                    it('removing not existing permission should succeed', function (done) {
                        var userPermissions = {
                            permissionsToAdd: [],
                            permissionsToRemove: [globalPermission_1.GlobalPermission.ADMIN]
                        };
                        server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(function () {
                            userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                                .then(function (_actualPermissions) {
                                permissionsOfUserToModify.forEach(function (_permission) {
                                    chai_1.expect(_actualPermissions).to.not.contain(globalPermission_1.GlobalPermission.ADMIN);
                                });
                                done();
                            });
                        });
                    });
                    it('adding existing permissions should succeed', function (done) {
                        var userPermissions = {
                            permissionsToAdd: permissionsOfUserToModify,
                            permissionsToRemove: []
                        };
                        server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(function () {
                            userDataHandler_1.UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                                .then(function (_actualPermissions) {
                                permissionsOfUserToModify.forEach(function (_permission) {
                                    chai_1.expect(_actualPermissions).to.contain(_permission);
                                });
                                done();
                            });
                        });
                    });
                });
            });
            describe('logout', notAuthorizedTests);
        };
    };
    describe('user not logged in', notAuthorizedTests);
    describe('user registered', autorizedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
            .then(function (_user) {
            users.push(_user);
            return _user;
        });
    }));
    describe('user logged in', autorizedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userLoginManager_1.UserLoginManager.logoutUser(server); })
            .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); })
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
            .then(function (_user) {
            users.push(_user);
            return _user;
        });
    }));
});
//# sourceMappingURL=usersController.test.js.map