"use strict";
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getUserTeamsOperation_1 = require('./getUserTeamsOperation');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('GetUserTeamsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var user;
        var userTeam1;
        var userTeam2;
        var userTeam3;
        var isAdminInTeam1 = true;
        var isAdminInTeam2 = false;
        var isAdminInTeam3 = true;
        var operation;
        beforeEach(function () {
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
            });
            var createTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createTeams(3)
                .then(function (_teams) {
                userTeam1 = _teams[0], userTeam2 = _teams[1], userTeam3 = _teams[2];
            });
            return Promise.all([
                createUserPromise,
                createTeamsPromise
            ]).then(function () {
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(userTeam1, user, isAdminInTeam1)),
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(userTeam2, user, isAdminInTeam2)),
                    teamsDataHandler_1.TeamsDataHandler.addTeamMember(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(userTeam3, user, isAdminInTeam3))
                ]);
            }).then(function () {
                operation = new getUserTeamsOperation_1.GetUserTeamsOperation(user.id);
            });
        });
        it('should return correct teams', function () {
            var resultPromise = operation.execute();
            var expectedTeams = [userTeam1, userTeam2, userTeam3];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUserTeams) {
                var actualTeams = _.map(_actualUserTeams, function (_) { return _.team; });
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(actualTeams, expectedTeams);
            });
        });
        it('should return correct team admin rights', function () {
            var resultPromise = operation.execute();
            var expected = [
                { team: userTeam1, isAdmin: isAdminInTeam1 },
                { team: userTeam2, isAdmin: isAdminInTeam2 },
                { team: userTeam3, isAdmin: isAdminInTeam3 }
            ];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUserTeams) {
                var actualUserTeamsOrdered = _.orderBy(_actualUserTeams, function (_) { return _.team.id; });
                var expectedUserTeamsOrdered = _.orderBy(expected, function (_) { return _.team.id; });
                var actualRights = _.map(actualUserTeamsOrdered, function (_) { return _.isAdmin; });
                var expectedRights = _.map(expectedUserTeamsOrdered, function (_) { return _.isAdmin; });
                chai_1.expect(actualRights).to.be.deep.equal(expectedRights);
            });
        });
    });
});
//# sourceMappingURL=getUserTeamsOperation.test.js.map