"use strict";
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
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
        it('checking if user can update other user password should fail', function (done) {
            server.get('/user/1/can-update-password')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('checking if user can modify teams list should fail', function (done) {
            server.get('/user/can-modify-teams-list')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('checking if user can modify skills list should fail', function (done) {
            server.get('/user/can-modify-skills-list')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('getting user team modification permissions should fail', function (done) {
            server.get('/user/team-modification-permissions/1')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('getting user skill modification permissions should fail', function (done) {
            server.get('/user/skill-modification-permissions/1')
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
            it('getting logged in user details should succeed', function (done) {
                var expectedUser = getExpectedUserDetails(user);
                server.get('/user')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(expectedUser)
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
            describe('update password', function () {
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
                    var newUserPassword = {
                        password: userDefinition.password,
                        newPassword: 'some new other user password'
                    };
                    server.put('/user/' + (user.id + 1) + '/password')
                        .send(newUserPassword)
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                it('updating other user password with admin user should succeed', function (done) {
                    var otherUserInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(43);
                    var otherUserPassword = 'some other user password';
                    otherUserInfo.password_hash = passwordHash.generate(otherUserPassword);
                    var otherUser;
                    var newUserPassword = {
                        password: otherUserPassword,
                        newPassword: 'some new other user password'
                    };
                    userDataHandler_1.UserDataHandler.createUser(otherUserInfo)
                        .then(function (_user) {
                        otherUser = _user;
                    })
                        .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]); })
                        .then(function () {
                        server.put('/user/' + otherUser.id + '/password')
                            .send(newUserPassword)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                });
                it('updating other user password with admin user should update the user password', function (done) {
                    var otherUserInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(43);
                    var otherUserPassword = 'some other user password';
                    otherUserInfo.password_hash = passwordHash.generate(otherUserPassword);
                    var otherUser;
                    var newUserPassword = {
                        password: otherUserPassword,
                        newPassword: 'some new other user password'
                    };
                    userDataHandler_1.UserDataHandler.createUser(otherUserInfo)
                        .then(function (_user) {
                        otherUser = _user;
                    })
                        .then(function () { return userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN]); })
                        .then(function () {
                        server.put('/user/' + otherUser.id + '/password')
                            .send(newUserPassword)
                            .end(function () {
                            userDataHandler_1.UserDataHandler.getUser(otherUser.id)
                                .then(function (_user) {
                                chai_1.expect(passwordHash.verify(newUserPassword.newPassword, _user.attributes.password_hash));
                                done();
                            });
                        });
                    });
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
            describe('canUpdatePassword', function () {
                var userToChangePasswordOf;
                beforeEach(function () {
                    var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(22);
                    return userDataHandler_1.UserDataHandler.createUser(userInfo)
                        .then(function (_user) {
                        userToChangePasswordOf = _user;
                    });
                });
                it('checking can update password for not existing user should return false', function (done) {
                    server.get('/user/999999/can-update-password')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ canUpdatePassword: false })
                        .end(done);
                });
                it('checking can update password for myself should return true', function (done) {
                    server.get('/user/' + user.id + '/can-update-password')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ canUpdatePassword: true })
                        .end(done);
                });
                it('checking can update password for other user should return false', function (done) {
                    server.get('/user/' + userToChangePasswordOf.id + '/can-update-password')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ canUpdatePassword: false })
                        .end(done);
                });
                it('checking can update password with admin for other user should return true', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN])
                        .then(function () {
                        server.get('/user/' + userToChangePasswordOf.id + '/can-update-password')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canUpdatePassword: true })
                            .end(done);
                    });
                });
            });
            describe('canModifyTeamsList', function () {
                it('checking can modify teams list with permissions other than teams list admin or admin should return false', function (done) {
                    var permissions = _.difference(enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission), [globalPermission_1.GlobalPermission.ADMIN, globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions)
                        .then(function () {
                        server.get('/user/can-modify-teams-list')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canModifyTeamsList: false })
                            .end(done);
                    });
                });
                it('checking can modify teams list with teams list admin should return true', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN])
                        .then(function () {
                        server.get('/user/can-modify-teams-list/')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canModifyTeamsList: true })
                            .end(done);
                    });
                });
                it('checking can modify teams list with admin should return true', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN])
                        .then(function () {
                        server.get('/user/can-modify-teams-list/')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canModifyTeamsList: true })
                            .end(done);
                    });
                });
            });
            describe('canModifySkillsList', function () {
                it('checking can modify teams list with permissions other than skills list admin or admin should return false', function (done) {
                    var permissions = _.difference(enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission), [globalPermission_1.GlobalPermission.ADMIN, globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions)
                        .then(function () {
                        server.get('/user/can-modify-skills-list')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canModifySkillsList: false })
                            .end(done);
                    });
                });
                it('checking can modify teams list with skills list admin should return true', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN])
                        .then(function () {
                        server.get('/user/can-modify-skills-list/')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canModifySkillsList: true })
                            .end(done);
                    });
                });
                it('checking can modify teams list with admin should return true', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN])
                        .then(function () {
                        server.get('/user/can-modify-skills-list/')
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({ canModifySkillsList: true })
                            .end(done);
                    });
                });
            });
            describe('team modification permissions', function () {
                var team;
                var otherTeam;
                beforeEach(function () {
                    return environmentDirtifier_1.EnvironmentDirtifier.createTeams(2, user.id)
                        .then(function (_teams) {
                        team = _teams[0], otherTeam = _teams[1];
                    });
                });
                it('getting user team modification permissions with not existing team should fail', function (done) {
                    server.get('/user/team-modification-permissions/12321')
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('getting user team modification permissions with user that is not admin nor teams list admin should reaturn all false', function (done) {
                    var permissions = _.difference(enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission), [globalPermission_1.GlobalPermission.ADMIN, globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions)
                        .then(function () {
                        server.get("/user/team-modification-permissions/" + team.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canModifyTeamName: false,
                            canModifyTeamAdmins: false,
                            canModifyTeamUsers: false
                        })
                            .end(done);
                    });
                });
                it('getting user team modification permissions with user that is teams list admin should return correct values', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN])
                        .then(function () {
                        server.get("/user/team-modification-permissions/" + team.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canModifyTeamName: true,
                            canModifyTeamAdmins: true,
                            canModifyTeamUsers: true
                        })
                            .end(done);
                    });
                });
                it('getting user team modification permissions with user that is admin should return correct values', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN])
                        .then(function () {
                        server.get("/user/team-modification-permissions/" + team.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canModifyTeamName: true,
                            canModifyTeamAdmins: true,
                            canModifyTeamUsers: true
                        })
                            .end(done);
                    });
                });
                it('checking can modify teams list with user that is admin in other team should return false', function (done) {
                    var teamMemberInfo = {
                        team_id: otherTeam.id,
                        user_id: user.id,
                        is_admin: true
                    };
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo)
                        .then(function () {
                        server.get("/user/team-modification-permissions/" + team.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canModifyTeamName: false,
                            canModifyTeamAdmins: false,
                            canModifyTeamUsers: false
                        })
                            .end(done);
                    });
                });
                it('checking can modify teams list with user that is team member in the team should return correct values', function (done) {
                    var teamMemberInfo = {
                        team_id: team.id,
                        user_id: user.id,
                        is_admin: false
                    };
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo)
                        .then(function () {
                        server.get("/user/team-modification-permissions/" + team.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canModifyTeamName: false,
                            canModifyTeamAdmins: false,
                            canModifyTeamUsers: false
                        })
                            .end(done);
                    });
                });
                it('checking can modify teams list with user that is team admin in the team should return correct values', function (done) {
                    var teamMemberInfo = {
                        team_id: team.id,
                        user_id: user.id,
                        is_admin: true
                    };
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo)
                        .then(function () {
                        server.get("/user/team-modification-permissions/" + team.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canModifyTeamName: true,
                            canModifyTeamAdmins: true,
                            canModifyTeamUsers: true
                        })
                            .end(done);
                    });
                });
            });
            describe('skill modification permissions', function () {
                var skill;
                beforeEach(function () {
                    return environmentDirtifier_1.EnvironmentDirtifier.createSkills(1, user.id)
                        .then(function (_skills) {
                        skill = _skills[0];
                    });
                });
                it('getting user skill modification permissions with not existing skill should fail', function (done) {
                    server.get('/user/skill-modification-permissions/12321')
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('getting user skill modification permissions with user that is not admin nor skills list admin should reaturn all false', function (done) {
                    var permissions = _.difference(enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission), [globalPermission_1.GlobalPermission.ADMIN, globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, permissions)
                        .then(function () {
                        server.get("/user/skill-modification-permissions/" + skill.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canAddPrerequisites: false,
                            canAddDependencies: false
                        })
                            .end(done);
                    });
                });
                it('getting user skill modification permissions with user that is skills list admin should return correct values', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN])
                        .then(function () {
                        server.get("/user/skill-modification-permissions/" + skill.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canAddPrerequisites: true,
                            canAddDependencies: true
                        })
                            .end(done);
                    });
                });
                it('getting user skill modification permissions with user that is admin should return correct values', function (done) {
                    userDataHandler_1.UserDataHandler.addGlobalPermissions(user.id, [globalPermission_1.GlobalPermission.ADMIN])
                        .then(function () {
                        server.get("/user/skill-modification-permissions/" + skill.id)
                            .expect(statusCode_1.StatusCode.OK)
                            .expect({
                            canAddPrerequisites: true,
                            canAddDependencies: true
                        })
                            .end(done);
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