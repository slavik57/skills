"use strict";
var errorUtils_1 = require("../../common/errors/errorUtils");
var updateUserPermissionsOperation_1 = require("../operations/userOperations/updateUserPermissionsOperation");
var getAllowedUserPermissionsToModifyOperation_1 = require("../operations/userOperations/getAllowedUserPermissionsToModifyOperation");
var globalPermissionConverter_1 = require("../enums/globalPermissionConverter");
var globalPermission_1 = require("../models/enums/globalPermission");
var getUserPermissionsOperation_1 = require("../operations/userOperations/getUserPermissionsOperation");
var updateUserPasswordOperation_1 = require("../operations/userOperations/updateUserPasswordOperation");
var userRequestIdValidator_1 = require("../../common/userRequestIdValidator");
var getUserByIdOperation_1 = require("../operations/userOperations/getUserByIdOperation");
var updateUserDetailsOperation_1 = require("../operations/userOperations/updateUserDetailsOperation");
var statusCode_1 = require("../enums/statusCode");
var authenticator_1 = require("../expressMiddlewares/authenticator");
var getUserOperation_1 = require("../operations/userOperations/getUserOperation");
var _ = require('lodash');
var enum_values_1 = require('enum-values');
function permissionGuestFilter(permissions) {
    return _.difference(permissions, [globalPermission_1.GlobalPermission.GUEST]);
}
module.exports = {
    get_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getUserByIdOperation_1.GetUserByIdOperation(request.user.id);
            operation.execute()
                .then(function (_user) {
                response.json({
                    id: _user.id,
                    username: _user.attributes.username,
                    email: _user.attributes.email,
                    firstName: _user.attributes.firstName,
                    lastName: _user.attributes.lastName
                });
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
    put_id: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, id) {
            var updateUserDetails = request.body;
            if (!userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, id)) {
                response.status(statusCode_1.StatusCode.UNAUTHORIZED).send();
                return;
            }
            var numberId = Number(id);
            var operation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(numberId, updateUserDetails.username, updateUserDetails.email, updateUserDetails.firstName, updateUserDetails.lastName);
            operation.execute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send(); }, function (error) { return response.status(statusCode_1.StatusCode.BAD_REQUEST).send({ error: error }); });
        }],
    put_userId_password: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, userId) {
            var updateUserPassword = request.body;
            var numberId = Number(userId);
            var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(numberId, updateUserPassword.password, updateUserPassword.newPassword, request.user.id);
            operation.execute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send(); }, function (error) {
                var statusCode = statusCode_1.StatusCode.BAD_REQUEST;
                if (error === 'Wrong password' ||
                    errorUtils_1.ErrorUtils.IsUnautorizedError(error)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                return response.status(statusCode).send({ error: error });
            });
        }],
    get_userId_permissions: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, userId) {
            var numberId = Number(userId);
            var operation = new getUserPermissionsOperation_1.GetUserPermissionsOperation(numberId);
            operation.execute()
                .then(function (permissions) {
                var permissionsWithoutGuest = permissionGuestFilter(permissions);
                var permissionsNames = _.map(permissionsWithoutGuest, function (_permission) { return globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_permission); });
                response.send(permissionsNames.sort(function (_1, _2) { return _1.value - _2.value; }));
            });
        }],
    get_permissionsModificationRules: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(request.user.id);
            operation.execute()
                .then(function (permissions) {
                var allPermissions = enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission);
                var permissionsWithoutGuest = permissionGuestFilter(allPermissions);
                var result = _.map(permissionsWithoutGuest, function (_permission) { return globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_permission); })
                    .map(function (_userPermissionResult) {
                    return {
                        value: _userPermissionResult.value,
                        name: _userPermissionResult.name,
                        description: _userPermissionResult.description,
                        allowedToChange: permissions.indexOf(_userPermissionResult.value) >= 0
                    };
                });
                response.send(result.sort(function (_1, _2) { return _1.value - _2.value; }));
            });
        }],
    put_userId_permissions: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, userId) {
            var numberId = Number(userId);
            var updateUserPermissions = request.body;
            var operation = new updateUserPermissionsOperation_1.UpdateUserPermissionsOperation(numberId, updateUserPermissions.permissionsToAdd, updateUserPermissions.permissionsToRemove, request.user.id);
            operation.execute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send(); }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.IsUnautorizedError(error)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                return response.status(statusCode).send({ error: error });
            });
        }]
};
//# sourceMappingURL=userController.js.map