"use strict";
var unauthorizedError_1 = require("../../../common/errors/unauthorizedError");
var errorUtils_1 = require("../../../common/errors/errorUtils");
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var updateTeamNameOperation_1 = require("./updateTeamNameOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var bluebirdPromise = require('bluebird');
chai.use(chaiAsPromised);
describe('UpdateTeamNameOperation', function () {
    var executingUser;
    var team;
    var otherTeam;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1); })
            .then(function (_users) {
            executingUser = _users[0];
        })
            .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(2, executingUser.id); })
            .then(function (_teams) {
            team = _teams[0], otherTeam = _teams[1];
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        describe('on invalid team name', function () {
            var operation;
            beforeEach(function () {
                operation = new updateTeamNameOperation_1.UpdateTeamNameOperation(team.id, '', executingUser.id);
            });
            it('should fail execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('should not update the team', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeam(team.id); })
                    .then(function (_team) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_team.attributes, team.attributes);
                });
            });
        });
        describe('on valid team name', function () {
            var operation;
            var newTeamName;
            beforeEach(function () {
                newTeamName = 'new team name';
                operation = new updateTeamNameOperation_1.UpdateTeamNameOperation(team.id, newTeamName, executingUser.id);
            });
            describe('user without needed permissions', function () {
                beforeEach(function () {
                    var permissions = [
                        globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                        globalPermission_1.GlobalPermission.READER,
                        globalPermission_1.GlobalPermission.GUEST
                    ];
                    var teamMemberInfo = {
                        team_id: team.id,
                        user_id: executingUser.id,
                        is_admin: false
                    };
                    return bluebirdPromise.all([
                        teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo),
                        userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions)
                    ]);
                });
                it('should fail', function () {
                    return chai_1.expect(operation.execute()).to.eventually.rejected
                        .then(function (_error) {
                        chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, unauthorizedError_1.UnauthorizedError)).to.be.true;
                    });
                });
                it('should not update the team name', function () {
                    return teamsDataHandler_1.TeamsDataHandler.getTeam(team.id)
                        .then(function (_team) {
                        modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_team.attributes, team.attributes);
                    });
                });
            });
            var onSufficientPermissions = function (beforeEachFunc) {
                return function () {
                    beforeEach(beforeEachFunc);
                    it('should succeed execution', function () {
                        var result = operation.execute();
                        return chai_1.expect(result).to.eventually.fulfilled;
                    });
                    it('should update the team name', function () {
                        var result = operation.execute();
                        return chai_1.expect(result).to.eventually.fulfilled
                            .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeam(team.id); })
                            .then(function (_team) {
                            chai_1.expect(_team.attributes.name).to.be.equal(newTeamName);
                        });
                    });
                    it('should return the team', function () {
                        var result = operation.execute();
                        return chai_1.expect(result).to.eventually.fulfilled
                            .then(function (_team) {
                            chai_1.expect(_team.id).to.be.equal(team.id);
                            chai_1.expect(_team.attributes.name).to.be.equal(newTeamName);
                        });
                    });
                    it('with same team name should succeed', function () {
                        var updateUserDetailsOperation = new updateTeamNameOperation_1.UpdateTeamNameOperation(team.id, team.attributes.name, executingUser.id);
                        var result = updateUserDetailsOperation.execute()
                            .then(function () { return operation.execute(); });
                        return chai_1.expect(result).to.eventually.fulfilled;
                    });
                    it('with existing team name should fail', function () {
                        var updateUserDetailsOperation = new updateTeamNameOperation_1.UpdateTeamNameOperation(team.id, otherTeam.attributes.name, executingUser.id);
                        var result = updateUserDetailsOperation.execute()
                            .then(function () { return operation.execute(); });
                        var expectedError = new alreadyExistsError_1.AlreadyExistsError();
                        expectedError.message = 'The team name is taken';
                        return chai_1.expect(result).to.eventually.rejected
                            .then(function (error) {
                            chai_1.expect(error).to.deep.equal(expectedError);
                        });
                    });
                };
            };
            describe('user is admin', onSufficientPermissions(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            }));
            describe('user is team list admin', onSufficientPermissions(function () {
                var permissions = [
                    globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
                ];
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            }));
            describe('user is team admin', onSufficientPermissions(function () {
                var teamMemberInfo = {
                    team_id: team.id,
                    user_id: executingUser.id,
                    is_admin: true
                };
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            }));
        });
    });
});
//# sourceMappingURL=updateTeamNameOperation.test.js.map