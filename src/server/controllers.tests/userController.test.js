"use strict";
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var enum_values_1 = require("enum-values");
var globalPermissionConverter_1 = require("../enums/globalPermissionConverter");
var globalPermission_1 = require('../models/enums/globalPermission');
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var modelInfoVerificator_1 = require("../testUtils/modelInfoVerificator");
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
var passwordHash = require('password-hash');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('userController', function () {
    var expressServer;
    var server;
    var userDefinition;
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
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getExpectedUserDetails(user) {
        return {
            id: user.id,
            username: user.attributes.username,
            firstName: user.attributes.firstName,
            lastName: user.attributes.lastName,
            email: user.attributes.email
        };
    }
    var notAuthorizedTests = function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('getting user details should fail', function (done) {
            server.get('/user')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('checking if not existing user exists should return false', function (done) {
            server.get('/user/notExistingUser/exists')
                .expect(statusCode_1.StatusCode.OK)
                .expect({ userExists: false })
                .end(done);
        });
        it('checking if existing user exists should return true', function (done) {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(123);
            userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function () {
                server.get('/user/' + userInfo.username + '/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: true })
                    .end(done);
            });
        });
        it('updating user details should fail', function (done) {
            server.put('/user/1')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('updating user password should fail', function (done) {
            server.put('/user/1/password')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('getting permissions modification rules should fail', function (done) {
            server.get('/user/permissions-modification-rules')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        describe('get user permissions', function () {
            var user;
            beforeEach(function () {
                return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                    .then(function (_users) {
                    user = _users[0];
                });
            });
            afterEach(function () {
                return environmentCleaner_1.EnvironmentCleaner.clearTables();
            });
            it('getting not existing user permissions should fail', function (done) {
                server.get('/user/123456/permissions')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('getting existing user permissions should fail', function (done) {
                server.get('/user/' + user.id + '/permissions')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
        it('updateing user permissions should fail', function (done) {
            server.put('/user/1/permissions')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
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
            it('getting user details should succeed', function (done) {
                var expectedUser = getExpectedUserDetails(user);
                server.get('/user')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(expectedUser)
                    .end(done);
            });
            it('checking if not existing user exists should return false', function (done) {
                server.get('/user/notExistingUser/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: false })
                    .end(done);
            });
            it('checking if existing user exists should return true', function (done) {
                server.get('/user/' + userDefinition.username + '/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: true })
                    .end(done);
            });
            it('updating user details should succeed and update the user details', function (done) {
                var newUserDetails = {
                    username: 'new user',
                    email: 'new@gmail.com',
                    firstName: 'new first name',
                    lastName: 'new last name'
                };
                var expectedUserInfo = {
                    username: newUserDetails.username,
                    password_hash: user.attributes.password_hash,
                    email: newUserDetails.email,
                    firstName: newUserDetails.firstName,
                    lastName: newUserDetails.lastName
                };
                server.put('/user/' + user.id)
                    .send(newUserDetails)
                    .expect(statusCode_1.StatusCode.OK)
                    .end(function () {
                    userDataHandler_1.UserDataHandler.getUser(user.id)
                        .then(function (_user) {
                        modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_user.attributes, expectedUserInfo);
                        done();
                    });
                });
            });
            it('updating other user details should fail', function (done) {
                server.put('/user/' + (user.id + 1))
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('updating user password should succeed and update the user password correctly', function (done) {
                var newUserPassword = {
                    password: userDefinition.password,
                    newPassword: 'some new password'
                };
                server.put('/user/' + user.id + '/password')
                    .send(newUserPassword)
                    .expect(statusCode_1.StatusCode.OK)
                    .end(function () {
                    userDataHandler_1.UserDataHandler.getUser(user.id)
                        .then(function (_user) {
                        chai_1.expect(passwordHash.verify(newUserPassword.newPassword, _user.attributes.password_hash));
                        done();
                    });
                });
            });
            it('updating other user password should fail', function (done) {
                server.put('/user/' + (user.id + 1) + '/password')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('updating user password with empty password should fail', function (done) {
                var newUserPassword = {
                    password: '',
                    newPassword: 'some new password'
                };
                server.put('/user/' + user.id + '/password')
                    .send(newUserPassword)
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .expect({ error: 'Wrong password' })
                    .end(done);
            });
            it('updating user password with wrong password should fail', function (done) {
                var newUserPassword = {
                    password: 'wrong password',
                    newPassword: 'some new password'
                };
                server.put('/user/' + user.id + '/password')
                    .send(newUserPassword)
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .expect({ error: 'Wrong password' })
                    .end(done);
            });
            it('updating user password with empty newPassword should fail', function (done) {
                var newUserPassword = {
                    password: userDefinition.password,
                    newPassword: ''
                };
                server.put('/user/' + user.id + '/password')
                    .send(newUserPassword)
                    .expect(statusCode_1.StatusCode.BAD_REQUEST)
                    .expect({ error: 'The new password cannot be empty' })
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
                    return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                        .then(function (_users) {
                        user = _users[0];
                    })
                        .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions); });
                });
                it('getting not existing user permissions should succeed with empty permissions', function (done) {
                    server.get('/user/123456/permissions')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect([])
                        .end(done);
                });
                it('getting existing user permissions should succeed', function (done) {
                    server.get('/user/' + user.id + '/permissions')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedPermissions)
                        .end(done);
                });
            });
            describe('getting permissions modification', function () {
                it('getting admin permissions modification rules should return correct values', function (done) {
                    var allowedToChangeByAdmin = [
                        globalPermission_1.GlobalPermission.ADMIN,
                        globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                        globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                    ];
                    var expectedPermissions = enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission)
                        .filter(function (_) { return _ !== globalPermission_1.GlobalPermission.GUEST; })
                        .map(function (_) { return globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_); })
                        .map(function (_) {
                        return {
                            value: _.value,
                            name: _.name,
                            description: _.description,
                            allowedToChange: allowedToChangeByAdmin.indexOf(_.value) >= 0
                        };
                    }).sort(function (_1, _2) { return _1.value - _2.value; });
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN])
                        .then(function () {
                        server.get('/user/permissions-modification-rules')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect(expectedPermissions)
                            .end(done);
                    });
                });
                it('getting skill list admin permissions modification rules should return correct values', function (done) {
                    var allowedToChangeBySkillListAdmin = [
                        globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
                    ];
                    var expectedPermissions = enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission)
                        .filter(function (_) { return _ !== globalPermission_1.GlobalPermission.GUEST; })
                        .map(function (_) { return globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_); })
                        .map(function (_) {
                        return {
                            value: _.value,
                            name: _.name,
                            description: _.description,
                            allowedToChange: allowedToChangeBySkillListAdmin.indexOf(_.value) >= 0
                        };
                    });
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN])
                        .then(function () {
                        server.get('/user/permissions-modification-rules')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect(expectedPermissions.sort(function (_1, _2) { return _1.value - _2.value; }))
                            .end(done);
                    });
                });
            });
            describe('logout', notAuthorizedTests);
            describe('update user permissions', function () {
                var userToModifyPermissionsOf;
                var permissionsOfUserToModify;
                beforeEach(function () {
                    permissionsOfUserToModify = [
                        globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                    ];
                    return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                        .then(function (_users) {
                        userToModifyPermissionsOf = _users[0];
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
                        server.put('/user/' + userToModifyPermissionsOf.id + '/permissions')
                            .send(userPermissions)
                            .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                            .end(done);
                    });
                    it('adding permissions should fail', function (done) {
                        var userPermissions = {
                            permissionsToAdd: [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN],
                            permissionsToRemove: []
                        };
                        server.put('/user/' + userToModifyPermissionsOf.id + '/permissions')
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
                        server.put('/user/' + userToModifyPermissionsOf.id + '/permissions')
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
                        server.put('/user/' + userToModifyPermissionsOf.id + '/permissions')
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
                        server.put('/user/' + userToModifyPermissionsOf.id + '/permissions')
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
                        server.put('/user/' + userToModifyPermissionsOf.id + '/permissions')
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
        };
    };
    describe('user not logged in', notAuthorizedTests);
    describe('user registered', autorizedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); });
    }));
    describe('user logged in', autorizedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); })
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); });
    }));
});
//# sourceMappingURL=userController.test.js.map