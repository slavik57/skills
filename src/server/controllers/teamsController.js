"use strict";
var updateUserTeamAdminRightsOperation_1 = require("../operations/userOperations/updateUserTeamAdminRightsOperation");
var removeUserFromTeamOperation_1 = require("../operations/teamOperations/removeUserFromTeamOperation");
var notFoundError_1 = require("../../common/errors/notFoundError");
var addUserToTeamOperation_1 = require("../operations/teamOperations/addUserToTeamOperation");
var getTeamUsersOperation_1 = require("../operations/teamOperations/getTeamUsersOperation");
var updateTeamNameOperation_1 = require("../operations/teamOperations/updateTeamNameOperation");
var removeTeamOperation_1 = require("../operations/teamOperations/removeTeamOperation");
var getTeamByNameOperation_1 = require("../operations/teamOperations/getTeamByNameOperation");
var alreadyExistsError_1 = require("../../common/errors/alreadyExistsError");
var unauthorizedError_1 = require("../../common/errors/unauthorizedError");
var errorUtils_1 = require("../../common/errors/errorUtils");
var addTeamOperation_1 = require("../operations/teamOperations/addTeamOperation");
var getTeamsOperation_1 = require("../operations/teamOperations/getTeamsOperation");
var statusCode_1 = require("../enums/statusCode");
var authenticator_1 = require("../expressMiddlewares/authenticator");
var _ = require('lodash');
module.exports = {
    get_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getTeamsOperation_1.GetTeamsOperation();
            operation.execute()
                .then(function (_teams) {
                return _.map(_teams, function (_team) {
                    return {
                        id: _team.id,
                        teamName: _team.attributes.name
                    };
                });
            })
                .then(function (_teamInfoResponses) {
                return _teamInfoResponses.sort(function (_info1, _info2) { return _info1.id - _info2.id; });
            })
                .then(function (_teamInfoResponses) {
                response.json(_teamInfoResponses);
            });
        }],
    get_teamName_exists: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamName) {
            var operation = new getTeamByNameOperation_1.GetTeamByNameOperation(teamName);
            operation.execute()
                .then(function (team) {
                var teamExists = !!team;
                response.send({
                    teamExists: teamExists
                });
            });
        }],
    post_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var createTeamRequest = request.body;
            if (!createTeamRequest || !createTeamRequest.name) {
                response.status(statusCode_1.StatusCode.BAD_REQUEST);
                response.send();
                return;
            }
            var teamInfo = {
                name: createTeamRequest.name
            };
            var addOperation = new addTeamOperation_1.AddTeamOperation(teamInfo, request.user.id);
            addOperation.execute()
                .then(function (_team) {
                response.status(statusCode_1.StatusCode.OK);
                response.send({
                    id: _team.id,
                    teamName: _team.attributes.name
                });
            }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                else if (errorUtils_1.ErrorUtils.isErrorOfType(error, alreadyExistsError_1.AlreadyExistsError)) {
                    statusCode = statusCode_1.StatusCode.CONFLICT;
                }
                response.status(statusCode);
                response.send();
            });
        }],
    post_teamId_members: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId) {
            var numberId = Number(teamId);
            var addTeamMemberRequest = request.body;
            if (!addTeamMemberRequest || !addTeamMemberRequest.username) {
                response.status(statusCode_1.StatusCode.BAD_REQUEST);
                response.send();
                return;
            }
            var operation = new addUserToTeamOperation_1.AddUserToTeamOperation(addTeamMemberRequest.username, numberId, false, request.user.id);
            operation.execute()
                .then(function (_teamMember) {
                response.status(statusCode_1.StatusCode.OK);
                response.send({
                    id: _teamMember.attributes.user_id,
                    username: addTeamMemberRequest.username,
                    isAdmin: _teamMember.attributes.is_admin
                });
            }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                var errorDescription;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                else if (errorUtils_1.ErrorUtils.isErrorOfType(error, notFoundError_1.NotFoundError)) {
                    statusCode = statusCode_1.StatusCode.NOT_FOUND;
                }
                else if (errorUtils_1.ErrorUtils.isErrorOfType(error, alreadyExistsError_1.AlreadyExistsError)) {
                    statusCode = statusCode_1.StatusCode.CONFLICT;
                    errorDescription = { error: 'The user is already in the team' };
                }
                response.status(statusCode);
                response.send(errorDescription);
            });
        }],
    delete_teamId_members: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId) {
            var numberId = Number(teamId);
            var removeTeamMemberRequest = request.body;
            if (!removeTeamMemberRequest || !removeTeamMemberRequest.userId) {
                response.status(statusCode_1.StatusCode.BAD_REQUEST);
                response.send();
                return;
            }
            var operation = new removeUserFromTeamOperation_1.RemoveUserFromTeamOperation(removeTeamMemberRequest.userId, numberId, request.user.id);
            operation.execute()
                .then(function () {
                response.status(statusCode_1.StatusCode.OK);
                response.send();
            }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                response.status(statusCode);
                response.send();
            });
        }],
    put_teamId_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId) {
            var updateTeamRequest = request.body;
            if (!updateTeamRequest || !updateTeamRequest.name) {
                response.status(statusCode_1.StatusCode.BAD_REQUEST);
                response.send();
                return;
            }
            var numberId = Number(teamId);
            var operation = new updateTeamNameOperation_1.UpdateTeamNameOperation(numberId, updateTeamRequest.name, request.user.id);
            operation.execute()
                .then(function (_team) {
                response.status(statusCode_1.StatusCode.OK);
                response.send({
                    id: _team.id,
                    teamName: _team.attributes.name
                });
            }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                else if (errorUtils_1.ErrorUtils.isErrorOfType(error, alreadyExistsError_1.AlreadyExistsError)) {
                    statusCode = statusCode_1.StatusCode.CONFLICT;
                }
                response.status(statusCode);
                response.send();
            });
        }],
    delete_teamId_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId) {
            var numberId = Number(teamId);
            var operation = new removeTeamOperation_1.RemoveTeamOperation(numberId, request.user.id);
            operation.execute()
                .then(function () {
                response.status(statusCode_1.StatusCode.OK);
                response.send();
            }, function (error) {
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    response.status(statusCode_1.StatusCode.UNAUTHORIZED);
                }
                else {
                    response.status(statusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                }
                response.send();
            });
        }],
    get_teamId_members: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId) {
            var numberId = Number(teamId);
            var operation = new getTeamUsersOperation_1.GetTeamUsersOperation(numberId);
            operation.execute()
                .then(function (_teamMembers) {
                var result = _.map(_teamMembers, function (_teamMember) {
                    return {
                        id: _teamMember.user.id,
                        username: _teamMember.user.attributes.username,
                        isAdmin: _teamMember.isAdmin
                    };
                }).sort(function (_info1, _info2) { return _info1.id - _info2.id; });
                response.json(result);
            });
        }],
    patch_teamId_members_memberId_admin: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId, memberId) {
            var teamIdNumber = Number(teamId);
            var memberIdNumber = Number(memberId);
            var modifyAdminRightsRequest = request.body;
            if (isNaN(teamIdNumber) ||
                isNaN(memberIdNumber) ||
                !modifyAdminRightsRequest ||
                modifyAdminRightsRequest.isAdmin === null ||
                modifyAdminRightsRequest.isAdmin === undefined) {
                response.status(statusCode_1.StatusCode.BAD_REQUEST);
                response.send();
                return;
            }
            var operation = new updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation(memberIdNumber, teamIdNumber, modifyAdminRightsRequest.isAdmin, request.user.id);
            operation.execute()
                .then(function () {
                response.status(statusCode_1.StatusCode.OK);
                response.send();
            }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                else if (errorUtils_1.ErrorUtils.isErrorOfType(error, notFoundError_1.NotFoundError)) {
                    statusCode = statusCode_1.StatusCode.NOT_FOUND;
                }
                response.status(statusCode);
                response.send();
            });
        }]
};
//# sourceMappingURL=teamsController.js.map