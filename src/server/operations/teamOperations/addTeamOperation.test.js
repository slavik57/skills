"use strict";
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var globalPermission_1 = require("../../models/enums/globalPermission");
var addTeamOperation_1 = require("./addTeamOperation");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var team_1 = require("../../models/team");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('AddTeamOperation', function () {
    var teamInfoToAdd;
    var executingUser;
    var operation;
    beforeEach(function () {
        teamInfoToAdd = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team');
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)); })
            .then(function (_user) {
            executingUser = _user;
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
                    .then(function () { return new team_1.Teams().fetch(); })
                    .then(function (_teamsCollection) { return _teamsCollection.toArray(); })
                    .then(function (_teams) {
                    chai_1.expect(_teams).to.be.length(0);
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
                    .then(function () { return new team_1.Teams().fetch(); })
                    .then(function (_teamsCollection) { return _teamsCollection.toArray(); })
                    .then(function (_teams) {
                    chai_1.expect(_teams).to.be.length(1);
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teams[0].attributes, teamInfoToAdd);
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
                    chai_1.expect(_teamsCreators).to.be.length(1);
                    var expectedTeamCreatorInfo = {
                        user_id: executingUser.id,
                        team_id: team.id
                    };
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teamsCreators[0].attributes, expectedTeamCreatorInfo);
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
                    .then(function () { return new team_1.Teams().fetch(); })
                    .then(function (_teamsCollection) { return _teamsCollection.toArray(); })
                    .then(function (_teams) {
                    chai_1.expect(_teams).to.be.length(1);
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teams[0].attributes, teamInfoToAdd);
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
                    chai_1.expect(_teamsCreators).to.be.length(1);
                    var expectedTeamCreatorInfo = {
                        user_id: executingUser.id,
                        team_id: team.id
                    };
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teamsCreators[0].attributes, expectedTeamCreatorInfo);
                });
            });
        });
    });
});
//# sourceMappingURL=addTeamOperation.test.js.map