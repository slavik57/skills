"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var skillsDataHandler_1 = require("../dataHandlers/skillsDataHandler");
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var userLoginManager_1 = require("../testUtils/userLoginManager");
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
describe('skillsController', function () {
    var expressServer;
    var server;
    var userDefinition;
    var skillCreatorUser;
    var skills;
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
        return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
            .then(function (_users) {
            skillCreatorUser = _users[0];
        });
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return environmentDirtifier_1.EnvironmentDirtifier.createSkills(5, skillCreatorUser.id)
            .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); })
            .then(function (_skills) {
            skills = _skills;
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getExpectedSkillsDetails(skills) {
        return _.map(skills, function (_skill) {
            return {
                id: _skill.id,
                skillName: _skill.attributes.name
            };
        });
    }
    var notAuthorizedTests = function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('getting skills details should fail', function (done) {
            server.get('/skills')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('adding skill should fail', function (done) {
            server.post('/skills')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        describe('checking if skill exists', function () {
            it('not existing skill should fail', function (done) {
                server.get('/skills/notExistingSkill/exists')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('existing skill should fail', function (done) {
                server.get('/skills/' + skills[0].attributes.name + '/exists')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    };
    var authorizdedTests = function (beforeEachFunc) {
        return function () {
            var executingUser;
            beforeEach(function () {
                return beforeEachFunc()
                    .then(function (_user) {
                    executingUser = _user;
                });
            });
            it('getting skills details should succeed', function (done) {
                var expectedSkills = getExpectedSkillsDetails(skills).sort(function (_1, _2) { return _1.id - _2.id; });
                server.get('/skills')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(expectedSkills)
                    .end(done);
            });
            describe('checking if skill exists', function () {
                it('not existing skill', function (done) {
                    server.get('/skills/notExistingSkill/exists')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ skillExists: false })
                        .end(done);
                });
                it('existing skill should return true', function (done) {
                    server.get('/skills/' + skills[0].attributes.name + '/exists')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect({ skillExists: true })
                        .end(done);
                });
            });
            describe('add skill', function () {
                it('adding skill without sufficient permissions should fail', function (done) {
                    server.post('/skills')
                        .send({ name: 'some new name' })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('adding skill without body should fail', function (done) {
                        server.post('/skills')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('adding skill with empty body should fail', function (done) {
                        server.post('/skills')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('adding skill with empty skill name should fail', function (done) {
                        server.post('/skills')
                            .send({ name: '' })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('adding skill with existing skill name should fail', function (done) {
                        server.post('/skills')
                            .send({ name: skills[0].attributes.name })
                            .expect(statusCode_1.StatusCode.CONFLICT)
                            .end(done);
                    });
                    it('adding new skill should succeed', function (done) {
                        server.post('/skills')
                            .send({ name: 'some new skill name' })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('adding new skill should add the skill', function (done) {
                        var newSkillName = 'some new skill name';
                        server.post('/skills')
                            .send({ name: newSkillName })
                            .end(function () {
                            skillsDataHandler_1.SkillsDataHandler.getSkills()
                                .then(function (_skills) { return _.find(_skills, function (_) { return _.attributes.name === newSkillName; }); })
                                .then(function (_skill) {
                                chai_1.expect(_skill).to.exist;
                                done();
                            });
                        });
                    });
                    it('adding new skill should return the skill info', function (done) {
                        var newSkillName = 'some new skill name';
                        server.post('/skills')
                            .send({ name: newSkillName })
                            .end(function (error, response) {
                            return skillsDataHandler_1.SkillsDataHandler.getSkills()
                                .then(function (_skills) { return _.find(_skills, function (_) { return _.attributes.name === newSkillName; }); })
                                .then(function (_skill) {
                                chai_1.expect(response.body).to.deep.equal({
                                    id: _skill.id,
                                    skillName: newSkillName
                                });
                                done();
                            });
                        });
                    });
                };
                describe('User is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('User is skills list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
            });
            describe('delete skill', function () {
                it('deleting skill without sufficient permissions should fail', function (done) {
                    server.delete('/skills/' + skills[0].id)
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('deleting not existing skill should succeed', function (done) {
                        server.delete('/skills/' + 9996655)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('deleting existing skill should succeed', function (done) {
                        server.delete('/skills/' + skills[0].id)
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('deleting existing skill should delete the skill', function (done) {
                        var skillIdToDelete = skills[0].id;
                        server.delete('/skills/' + skillIdToDelete)
                            .end(function () {
                            skillsDataHandler_1.SkillsDataHandler.getSkills()
                                .then(function (_skills) { return _.map(_skills, function (_) { return _.id; }); })
                                .then(function (_skillIds) {
                                chai_1.expect(_skillIds).not.to.contain(skillIdToDelete);
                                done();
                            });
                        });
                    });
                };
                describe('User is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('User is skills list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
            });
            describe('logout', notAuthorizedTests);
        };
    };
    describe('user not logged in', notAuthorizedTests);
    describe('user registered', authorizdedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); });
    }));
    describe('user logged in', authorizdedTests(function () {
        return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
            .then(function () { return userLoginManager_1.UserLoginManager.logoutUser(server); })
            .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); })
            .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); });
    }));
});
//# sourceMappingURL=skillsController.test.js.map