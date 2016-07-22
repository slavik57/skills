"use strict";
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
    describe('user not logged in', function () {
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
    });
    describe('user registered', function () {
        var user;
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
                .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
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
            beforeEach(function () {
                permissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                    .then(function (_users) {
                    user = _users[0];
                })
                    .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions); });
            });
            afterEach(function () {
                return environmentCleaner_1.EnvironmentCleaner.clearTables();
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
                    .expect(permissions)
                    .end(done);
            });
        });
        describe('logout', function () {
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
                server.get('/user/' + userDefinition.username + '/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: true })
                    .end(done);
            });
            it('updating user details should fail', function (done) {
                server.put('/user/' + user.id)
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('updating user password should fail', function (done) {
                server.put('/user/1/password')
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
        });
    });
    describe('user logged in', function () {
        var user;
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
                .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); })
                .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
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
            var expectedUserInfo = {
                username: userDefinition.username,
                password_hash: passwordHash.generate(newUserPassword.newPassword),
                email: userDefinition.email,
                firstName: userDefinition.firstName,
                lastName: userDefinition.lastName
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
                password: '',
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
            beforeEach(function () {
                permissions = [
                    globalPermission_1.GlobalPermission.ADMIN,
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER
                ];
                return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                    .then(function (_users) {
                    user = _users[0];
                })
                    .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions); });
            });
            afterEach(function () {
                return environmentCleaner_1.EnvironmentCleaner.clearTables();
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
                    .expect(permissions)
                    .end(done);
            });
        });
        describe('logout', function () {
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
                server.get('/user/' + userDefinition.username + '/exists')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect({ userExists: true })
                    .end(done);
            });
            it('updating user details should fail', function (done) {
                server.put('/user/' + user.id)
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('updating user password should fail', function (done) {
                server.put('/user/1/password')
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
        });
    });
});
//# sourceMappingURL=userController.test.js.map