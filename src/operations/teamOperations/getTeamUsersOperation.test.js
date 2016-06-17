"use strict";
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getTeamUsersOperation_1 = require('./getTeamUsersOperation');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('GetTeamUsersOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var team;
        var teamUser1;
        var teamUser2;
        var teamUser3;
        var isUser1Admin = true;
        var isUser2Admin = false;
        var isUser3Admin = true;
        var operation;
        beforeEach(function () {
            var createTeamPromise = environmentDirtifier_1.EnvironmentDirtifier.createTeams(1)
                .then(function (_teams) {
                team = _teams[0];
            });
            var createUsersPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(3)
                .then(function (_users) {
                teamUser1 = _users[0], teamUser2 = _users[1], teamUser3 = _users[2];
            });
            return Promise.all([
                createTeamPromise,
                createUsersPromise
            ]).then(function () {
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, teamUser1, isUser1Admin)),
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, teamUser2, isUser2Admin)),
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, teamUser3, isUser3Admin))
                ]);
            }).then(function () {
                operation = new getTeamUsersOperation_1.GetTeamUsersOperation(team.id);
            });
        });
        it('should return correct users', function () {
            var resultPromise = operation.execute();
            var expectedUsers = [teamUser1, teamUser2, teamUser3];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualTeamUsers) {
                var actualUsers = _.map(_actualTeamUsers, function (_) { return _.user; });
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(actualUsers, expectedUsers);
            });
        });
        it('should return correct team admin rights', function () {
            var resultPromise = operation.execute();
            var expected = [
                { user: teamUser1, isAdmin: isUser1Admin },
                { user: teamUser2, isAdmin: isUser2Admin },
                { user: teamUser3, isAdmin: isUser3Admin }
            ];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualTeamUsers) {
                var actualTeamUsersOrdered = _.orderBy(_actualTeamUsers, function (_) { return _.user.id; });
                var expectedTeamUsersOrdered = _.orderBy(expected, function (_) { return _.user.id; });
                var actualRights = _.map(actualTeamUsersOrdered, function (_) { return _.isAdmin; });
                var expectedRights = _.map(expectedTeamUsersOrdered, function (_) { return _.isAdmin; });
                chai_1.expect(actualRights).to.be.deep.equal(expectedRights);
            });
        });
    });
});
//# sourceMappingURL=getTeamUsersOperation.test.js.map