"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var notFoundError_1 = require("../../../common/errors/notFoundError");
var errorUtils_1 = require("../../../common/errors/errorUtils");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getTeamModificationPermissionsOperation_1 = require('./getTeamModificationPermissionsOperation');
var enum_values_1 = require('enum-values');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('GetTeamModificationPermissionsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var executingUser;
        var team;
        var otherTeam;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                executingUser = _users[0];
            })
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(2, executingUser.id); })
                .then(function (_teams) {
                team = _teams[0], otherTeam = _teams[1];
            });
        });
        it('not existing team should reject correctly', function () {
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(123321, executingUser.id);
            return chai_1.expect(operation.execute()).to.eventually.rejected
                .then(function (_error) {
                chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)).to.be.true;
            });
        });
        it('not existing user should reject correctly', function () {
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, 1232123);
            return chai_1.expect(operation.execute()).to.eventually.rejected
                .then(function (_error) {
                chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)).to.be.true;
            });
        });
        it('for regular team user should return correct value', function () {
            var teamMemberInfo = {
                team_id: team.id,
                user_id: executingUser.id,
                is_admin: false
            };
            var addTeamMemberPromise = teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, executingUser.id);
            var expectedPermissions = {
                canModifyTeamName: false,
                canModifyTeamAdmins: false,
                canModifyTeamUsers: false
            };
            var executePromise = addTeamMemberPromise.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for team admin should return correct value', function () {
            var teamMemberInfo = {
                team_id: team.id,
                user_id: executingUser.id,
                is_admin: true
            };
            var addTeamMemberPromise = teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, executingUser.id);
            var expectedPermissions = {
                canModifyTeamName: true,
                canModifyTeamAdmins: true,
                canModifyTeamUsers: true
            };
            var executePromise = addTeamMemberPromise.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for other team admin should return correct value', function () {
            var teamMemberInfo = {
                team_id: otherTeam.id,
                user_id: executingUser.id,
                is_admin: true
            };
            var addTeamMemberPromise = teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, executingUser.id);
            var expectedPermissions = {
                canModifyTeamName: false,
                canModifyTeamAdmins: false,
                canModifyTeamUsers: false
            };
            var executePromise = addTeamMemberPromise.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for admin should return correct value', function () {
            var permissions = [
                globalPermission_1.GlobalPermission.ADMIN
            ];
            var addPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, executingUser.id);
            var expectedPermissions = {
                canModifyTeamName: true,
                canModifyTeamAdmins: true,
                canModifyTeamUsers: true
            };
            var executePromise = addPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for teams list admin should return correct value', function () {
            var permissions = [
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
            var addPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, executingUser.id);
            var expectedPermissions = {
                canModifyTeamName: true,
                canModifyTeamAdmins: true,
                canModifyTeamUsers: true
            };
            var executePromise = addPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for user that is not admin nor teams list admin should return correct value', function () {
            var permissions = _.difference(enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission), [globalPermission_1.GlobalPermission.ADMIN, globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN]);
            var addPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(team.id, executingUser.id);
            var expectedPermissions = {
                canModifyTeamName: false,
                canModifyTeamAdmins: false,
                canModifyTeamUsers: false
            };
            var executePromise = addPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
    });
});
//# sourceMappingURL=getTeamModificationPermissionsOperation.test.js.map