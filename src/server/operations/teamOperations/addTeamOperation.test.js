"use strict";
var errorUtils_1 = require("../../../common/errors/errorUtils");
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var globalPermission_1 = require("../../models/enums/globalPermission");
var addTeamOperation_1 = require("./addTeamOperation");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('AddTeamOperation', function () {
    var teamInfoToAdd;
    var executingUser;
    var existingTeam;
    var operation;
    beforeEach(function () {
        teamInfoToAdd = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team');
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)); })
            .then(function (_user) {
            executingUser = _user;
        })
            .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(1, executingUser.id); })
            .then(function (_teams) {
            existingTeam = _teams[0];
        })
            .then(function () {
            operation = new addTeamOperation_1.AddTeamOperation(teamInfoToAdd, executingUser.id);
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('canExecute', function () {
        describe('executing user has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should fail', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.rejected;
            });
        });
        describe('executing user is ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('adding existing team should fail', function () {
                var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);
                var operation = new addTeamOperation_1.AddTeamOperation(teamInfo, executingUser.id);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
        describe('executing user is TEAMS_LIST_ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed', function () {
                var resultPromise = operation.canExecute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled;
            });
            it('adding existing team should fail', function () {
                var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);
                var operation = new addTeamOperation_1.AddTeamOperation(teamInfo, executingUser.id);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
    });
    describe('execute', function () {
        describe('executing user has insufficient global permissions', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                    globalPermission_1.GlobalPermission.READER,
                    globalPermission_1.GlobalPermission.GUEST
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should fail and not add team', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamByName(teamInfoToAdd.name); })
                    .then(function (_team) {
                    chai_1.expect(_team).to.not.exist;
                });
            });
        });
        describe('executing user is ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed and add team', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamByName(teamInfoToAdd.name); })
                    .then(function (_team) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_team.attributes, teamInfoToAdd);
                });
            });
            it('should add the user as skill creator', function () {
                var resultPromise = operation.execute();
                var team;
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_teamm) {
                    team = _teamm;
                })
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamsCreators(); })
                    .then(function (_teamsCreators) {
                    return _.find(_teamsCreators, function (_) { return _.attributes.team_id === team.id; });
                })
                    .then(function (_teamsCreator) {
                    var expectedTeamCreatorInfo = {
                        user_id: executingUser.id,
                        team_id: team.id
                    };
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teamsCreator.attributes, expectedTeamCreatorInfo);
                });
            });
            it('adding existing team should fail', function () {
                var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);
                var operation = new addTeamOperation_1.AddTeamOperation(teamInfo, executingUser.id);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
        describe('executing user is TEAMS_LIST_ADMIN', function () {
            beforeEach(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            });
            it('should succeed and add team', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamByName(teamInfoToAdd.name); })
                    .then(function (_team) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_team.attributes, teamInfoToAdd);
                });
            });
            it('should add the user as team creator', function () {
                var resultPromise = operation.execute();
                var team;
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_team) {
                    team = _team;
                })
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamsCreators(); })
                    .then(function (_teamsCreators) {
                    return _.find(_teamsCreators, function (_) { return _.attributes.team_id === team.id; });
                })
                    .then(function (_teamsCreator) {
                    var expectedTeamCreatorInfo = {
                        user_id: executingUser.id,
                        team_id: team.id
                    };
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teamsCreator.attributes, expectedTeamCreatorInfo);
                });
            });
            it('adding existing team should fail', function () {
                var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);
                var operation = new addTeamOperation_1.AddTeamOperation(teamInfo, executingUser.id);
                return chai_1.expect(operation.execute()).to.eventually.rejected
                    .then(function (_error) {
                    chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, alreadyExistsError_1.AlreadyExistsError)).to.be.true;
                });
            });
        });
    });
});
//# sourceMappingURL=addTeamOperation.test.js.map