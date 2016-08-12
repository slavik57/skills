"use strict";
var unauthorizedError_1 = require("../../common/errors/unauthorizedError");
var errorUtils_1 = require("../../common/errors/errorUtils");
var updateUserPermissionsOperation_1 = require("../operations/userOperations/updateUserPermissionsOperation");
var permissionsGuestFilter_1 = require("../../common/permissionsGuestFilter");
var globalPermissionConverter_1 = require("../enums/globalPermissionConverter");
var getUserPermissionsOperation_1 = require("../operations/userOperations/getUserPermissionsOperation");
var getUserOperation_1 = require("../operations/userOperations/getUserOperation");
var getUsersByPartialUsernameOperation_1 = require("../operations/userOperations/getUsersByPartialUsernameOperation");
var getUsersOperation_1 = require("../operations/userOperations/getUsersOperation");
var statusCode_1 = require("../enums/statusCode");
var authenticator_1 = require("../expressMiddlewares/authenticator");
var _ = require('lodash');
module.exports = {
    get_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getUsersOperation_1.GetUsersOperation();
            operation.execute()
                .then(function (_users) {
                return _.map(_users, function (_user) {
                    return {
                        id: _user.id,
                        username: _user.attributes.username
                    };
                });
            })
                .then(function (_userInfoResponses) {
                return _userInfoResponses.sort(function (_response1, _response2) { return _response1.id - _response2.id; });
            })
                .then(function (_userInfoResponses) {
                response.json(_userInfoResponses);
            });
        }],
    get_filtered_username: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, username) {
            var query = request.query;
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(username, Number(query.max));
            operation.execute()
                .then(function (_users) {
                return _.map(_users, function (_user) {
                    return {
                        id: _user.id,
                        username: _user.attributes.username
                    };
                });
            })
                .then(function (_userInfoResponses) {
                response.json(_userInfoResponses);
            });
        }],
    get_username_exists: function (request, response, username) {
        var operation = new getUserOperation_1.GetUserOperation(username);
        operation.execute()
            .then(function (user) {
            var userExists = !!user;
            response.send({
                userExists: userExists
            });
        });
    },
    get_userId_permissions: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, userId) {
            var numberId = Number(userId);
            var operation = new getUserPermissionsOperation_1.GetUserPermissionsOperation(numberId);
            operation.execute()
                .then(function (permissions) {
                var permissionsWithoutGuest = permissionsGuestFilter_1.PermissionsGuestFilter.filter(permissions);
                var permissionsNames = _.map(permissionsWithoutGuest, function (_permission) { return globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_permission); });
                response.send(permissionsNames.sort(function (_1, _2) { return _1.value - _2.value; }));
            });
        }],
    put_userId_permissions: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, userId) {
            var numberId = Number(userId);
            var updateUserPermissions = request.body;
            var operation = new updateUserPermissionsOperation_1.UpdateUserPermissionsOperation(numberId, updateUserPermissions.permissionsToAdd, updateUserPermissions.permissionsToRemove, request.user.id);
            operation.execute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send(); }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                return response.status(statusCode).send({ error: error });
            });
        }]
};
//# sourceMappingURL=usersController.js.map