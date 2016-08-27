"use strict";
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
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
var bluebirdPromise = require('bluebird');
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
        it('deleting skill should fail', function (done) {
            server.delete('/skills/1')
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
        it('getting skill prerequisites should fail', function (done) {
            server.get('/skills/' + skills[0].id + '/prerequisites')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('getting skill dependencies should fail', function (done) {
            server.get('/skills/' + skills[0].id + '/dependencies')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('adding skill prerequisite should fail', function (done) {
            server.post('/skills/1/prerequisites')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('adding skill dependency should fail', function (done) {
            server.post('/skills/1/dependencies')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        it('deleting skill prerequisite should fail', function (done) {
            server.delete('/skills/1/prerequisites')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
        describe('get filtered skills details by partial skill name', function () {
            it('should fail', function (done) {
                server.get('/skills/filtered/a')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
            it('with maximum number of skills should fail', function (done) {
                server.get('/skills/filtered/a?max=12')
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
            describe('getting skill prerequisites', function () {
                var skillOfSkillPrerequisites;
                var skillPrerequisites;
                var skillPrerequisitesInfos;
                beforeEach(function () {
                    skillOfSkillPrerequisites = skills[0];
                    skillPrerequisitesInfos = [
                        modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skillOfSkillPrerequisites, skills[1]),
                        modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skillOfSkillPrerequisites, skills[2])
                    ];
                    skillPrerequisites = [skills[1], skills[2]];
                    return bluebirdPromise.all([
                        skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisitesInfos[0]),
                        skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisitesInfos[1])
                    ]);
                });
                it('should return correct skill prerequisites', function (done) {
                    var expected = getExpectedSkillsDetails(skillPrerequisites).sort(function (_1, _2) { return _1.id - _2.id; });
                    server.get('/skills/' + skillOfSkillPrerequisites.id + '/prerequisites')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expected)
                        .end(done);
                });
            });
            describe('getting skill dependencies', function () {
                var skillOfSkillDependencies;
                var skillDependencies;
                var skillDependenciesInfos;
                beforeEach(function () {
                    skillOfSkillDependencies = skills[0];
                    skillDependenciesInfos = [
                        modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skills[1], skillOfSkillDependencies),
                        modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skills[2], skillOfSkillDependencies)
                    ];
                    skillDependencies = [skills[1], skills[2]];
                    return bluebirdPromise.all([
                        skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillDependenciesInfos[0]),
                        skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillDependenciesInfos[1])
                    ]);
                });
                it('should return correct skill dependencies', function (done) {
                    var expected = getExpectedSkillsDetails(skillDependencies).sort(function (_1, _2) { return _1.id - _2.id; });
                    server.get('/skills/' + skillOfSkillDependencies.id + '/dependencies')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expected)
                        .end(done);
                });
            });
            describe('add skill prerequisite', function () {
                var skillToAddPrerequisiteTo;
                var skillPrerequisiteToAdd;
                beforeEach(function () {
                    skillToAddPrerequisiteTo = skills[0];
                    skillPrerequisiteToAdd = skills[1];
                });
                it('on invalid skill name should fail', function (done) {
                    server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                        .send({ skillName: '' })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                        .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty skill name should fail', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: '' })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with not existing skill name should fail', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: 'not existing skill name' })
                            .expect(statusCode_1.StatusCode.NOT_FOUND)
                            .end(done);
                    });
                    it('with exiting skill name should succeed', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with existing skill name should add the prerequisite', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                            .end(function () {
                            skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillToAddPrerequisiteTo.id)
                                .then(function (_prerequisites) { return _.find(_prerequisites, function (_prerequisite) { return _prerequisite.id === skillPrerequisiteToAdd.id; }); })
                                .then(function (_prerequisite) {
                                chai_1.expect(_prerequisite.attributes.name).to.be.equal(skillPrerequisiteToAdd.attributes.name);
                                done();
                            });
                        });
                    });
                    it('should return the prerequisite info', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                            .end(function (error, response) {
                            chai_1.expect(response.body).to.deep.equal({
                                id: skillPrerequisiteToAdd.id,
                                skillName: skillPrerequisiteToAdd.attributes.name
                            });
                            done();
                        });
                    });
                    it('with skill that is already prerequisite should fail', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                            .end(function () {
                            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                                .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                                .expect(statusCode_1.StatusCode.CONFLICT)
                                .end(done);
                        });
                    });
                    it('with skill that is already prerequisite should fail with correct error', function (done) {
                        server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                            .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                            .end(function () {
                            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                                .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                                .expect({ error: 'The skill is already a prerequisite' })
                                .end(done);
                        });
                    });
                };
                describe('user is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is skills list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
            });
            describe('add skill dependency', function () {
                var skillToAddDependencyTo;
                var skillDependencyToAdd;
                beforeEach(function () {
                    skillToAddDependencyTo = skills[0];
                    skillDependencyToAdd = skills[1];
                });
                it('on invalid skill name should fail', function (done) {
                    server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                        .send({ skillName: '' })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                        .send({ skillName: skillDependencyToAdd.attributes.name })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty skill name should fail', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: '' })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with not existing skill name should fail', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: 'not existing skill name' })
                            .expect(statusCode_1.StatusCode.NOT_FOUND)
                            .end(done);
                    });
                    it('with exiting skill name should succeed', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: skillDependencyToAdd.attributes.name })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with existing skill name should add the dependency', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: skillDependencyToAdd.attributes.name })
                            .end(function () {
                            skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillDependencyToAdd.id)
                                .then(function (_prerequisites) { return _.find(_prerequisites, function (_prerequisite) { return _prerequisite.id === skillToAddDependencyTo.id; }); })
                                .then(function (_prerequisite) {
                                chai_1.expect(_prerequisite.attributes.name).to.be.equal(skillToAddDependencyTo.attributes.name);
                                done();
                            });
                        });
                    });
                    it('should return the dependency info', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: skillDependencyToAdd.attributes.name })
                            .end(function (error, response) {
                            chai_1.expect(response.body).to.deep.equal({
                                id: skillDependencyToAdd.id,
                                skillName: skillDependencyToAdd.attributes.name
                            });
                            done();
                        });
                    });
                    it('with skill that is already dependency should fail', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: skillDependencyToAdd.attributes.name })
                            .end(function () {
                            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                                .send({ skillName: skillDependencyToAdd.attributes.name })
                                .expect(statusCode_1.StatusCode.CONFLICT)
                                .end(done);
                        });
                    });
                    it('with skill that is already dependency should fail with correct error', function (done) {
                        server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                            .send({ skillName: skillDependencyToAdd.attributes.name })
                            .end(function () {
                            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                                .send({ skillName: skillDependencyToAdd.attributes.name })
                                .expect({ error: 'The skill is already a dependency' })
                                .end(done);
                        });
                    });
                };
                describe('user is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is skills list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
            });
            describe('remove skill prerequisite', function () {
                var skillToRemovePrerequisiteFrom;
                var prerequisiteSkillToRemove;
                beforeEach(function () {
                    skillToRemovePrerequisiteFrom = skills[0];
                    prerequisiteSkillToRemove = skills[1];
                    var info = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(skillToRemovePrerequisiteFrom, prerequisiteSkillToRemove);
                    return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(info);
                });
                it('on invalid prerequisiteId should fail', function (done) {
                    server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                        .send({ prerequisiteId: null })
                        .expect(statusCode_1.StatusCode.BAD_REQUEST)
                        .end(done);
                });
                it('without sufficient permissions should fail', function (done) {
                    server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                        .send({ prerequisiteId: prerequisiteSkillToRemove.id })
                        .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                        .end(done);
                });
                var sufficientPermissionsTests = function () {
                    it('without body should fail', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with empty body should fail', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .send({})
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with null prerequisiteId should fail', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .send({ prerequisiteId: null })
                            .expect(statusCode_1.StatusCode.BAD_REQUEST)
                            .end(done);
                    });
                    it('with not existing prerequisiteId should succeed', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .send({ prerequisiteId: 98765 })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with exiting prerequisiteId should succeed', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .send({ prerequisiteId: prerequisiteSkillToRemove.id })
                            .expect(statusCode_1.StatusCode.OK)
                            .end(done);
                    });
                    it('with existing prerequisiteId should remove the prerequisite from the skill', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .send({ prerequisiteId: prerequisiteSkillToRemove.id })
                            .end(function () {
                            skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillToRemovePrerequisiteFrom.id)
                                .then(function (_prerequisites) { return _.find(_prerequisites, function (_prerequisite) { return _prerequisite.id === prerequisiteSkillToRemove.id; }); })
                                .then(function (_prerequisite) {
                                chai_1.expect(_prerequisite).to.not.exist;
                                done();
                            });
                        });
                    });
                    it('with prerequisite that is not in the skill prerequisites should succeed', function (done) {
                        server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                            .send({ prerequisiteId: prerequisiteSkillToRemove.id })
                            .end(function () {
                            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                                .send({ prerequisiteId: prerequisiteSkillToRemove.id })
                                .expect(statusCode_1.StatusCode.OK)
                                .end(done);
                        });
                    });
                };
                describe('user is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
                describe('user is skills list admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
                    });
                    sufficientPermissionsTests();
                });
            });
            describe('get filtered skills details by partial skill name', function () {
                it('should return one skill', function (done) {
                    var skillWith1 = _.filter(skills, function (_) { return _.attributes.name.indexOf('skill1') >= 0; });
                    var expectedUsers = getExpectedSkillsDetails(skillWith1);
                    chai_1.expect(expectedUsers.length > 0).to.be.true;
                    server.get('/skills/filtered/skill1')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedUsers)
                        .end(done);
                });
                it('should return all skills', function (done) {
                    var skillsWithSkill = _.filter(skills, function (_) { return _.attributes.name.indexOf('skill') >= 0; });
                    var expectedUsers = getExpectedSkillsDetails(skillsWithSkill);
                    chai_1.expect(expectedUsers.length > 0).to.be.true;
                    server.get('/skills/filtered/skill')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedUsers)
                        .end(done);
                });
                it('with max number of skills limit should return one skill', function (done) {
                    var usersWith1 = _.filter(skills, function (_) { return _.attributes.name.indexOf('skill1') >= 0; });
                    var expectedUsers = getExpectedSkillsDetails(usersWith1);
                    chai_1.expect(expectedUsers.length).to.be.equal(1);
                    server.get('/skills/filtered/skill1?max=12')
                        .expect(statusCode_1.StatusCode.OK)
                        .expect(expectedUsers)
                        .end(done);
                });
                it('with max number of skills limit should return correct number of skills', function (done) {
                    var skillPrefix = 'skill';
                    var allRelevantSkills = _.filter(skills, function (_) { return _.attributes.name.indexOf(skillPrefix) >= 0; });
                    var allUsers = getExpectedSkillsDetails(allRelevantSkills);
                    var maxNumberOfSkills = 2;
                    chai_1.expect(allUsers.length).to.be.greaterThan(maxNumberOfSkills);
                    server.get('/skills/filtered/' + skillPrefix + '?max=' + maxNumberOfSkills)
                        .expect(statusCode_1.StatusCode.OK)
                        .end(function (error, response) {
                        var actualSkills = response.body;
                        chai_1.expect(actualSkills).to.be.length(maxNumberOfSkills);
                        actualSkills.forEach(function (_skill) {
                            chai_1.expect(_skill.skillName).to.contain(skillPrefix);
                        });
                        done();
                    });
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