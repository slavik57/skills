"use strict";
var getSkillModificationPermissionsOperation_1 = require("../operations/skillsOperations/getSkillModificationPermissionsOperation");
var skillOperationBase_1 = require("../operations/base/skillOperationBase");
var notFoundError_1 = require("../../common/errors/notFoundError");
var getTeamModificationPermissionsOperation_1 = require("../operations/teamOperations/getTeamModificationPermissionsOperation");
var modifyTeamOperationBase_1 = require("../operations/base/modifyTeamOperationBase");
var unauthorizedError_1 = require("../../common/errors/unauthorizedError");
var permissionsGuestFilter_1 = require("../../common/permissionsGuestFilter");
var errorUtils_1 = require("../../common/errors/errorUtils");
var getAllowedUserPermissionsToModifyOperation_1 = require("../operations/userOperations/getAllowedUserPermissionsToModifyOperation");
var globalPermissionConverter_1 = require("../enums/globalPermissionConverter");
var globalPermission_1 = require("../models/enums/globalPermission");
var updateUserPasswordOperation_1 = require("../operations/userOperations/updateUserPasswordOperation");
var userRequestIdValidator_1 = require("../../common/userRequestIdValidator");
var getUserByIdOperation_1 = require("../operations/userOperations/getUserByIdOperation");
var updateUserDetailsOperation_1 = require("../operations/userOperations/updateUserDetailsOperation");
var statusCode_1 = require("../enums/statusCode");
var authenticator_1 = require("../expressMiddlewares/authenticator");
var _ = require('lodash');
var enum_values_1 = require('enum-values');
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
                    errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                return response.status(statusCode).send({ error: error });
            });
        }],
    get_userId_canUpdatePassword: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, userId) {
            var numberId = Number(userId);
            var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(numberId, null, null, request.user.id);
            operation.canChangePassword(false)
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send({ canUpdatePassword: true }); }, function (error) {
                return response.status(statusCode_1.StatusCode.OK).send({ canUpdatePassword: false });
            });
        }],
    get_canModifyTeamsList: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new modifyTeamOperationBase_1.ModifyTeamOperationBase(request.user.id);
            operation.canExecute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send({ canModifyTeamsList: true }); }, function (error) { return response.status(statusCode_1.StatusCode.OK).send({ canModifyTeamsList: false }); });
        }],
    get_canModifySkillsList: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new skillOperationBase_1.SkillOperationBase(request.user.id);
            operation.canExecute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send({ canModifySkillsList: true }); }, function (error) { return response.status(statusCode_1.StatusCode.OK).send({ canModifySkillsList: false }); });
        }],
    get_permissionsModificationRules: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(request.user.id);
            operation.execute()
                .then(function (permissions) {
                var allPermissions = enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission);
                var permissionsWithoutGuest = permissionsGuestFilter_1.PermissionsGuestFilter.filter(allPermissions);
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
    get_teamModificationPermissions_teamId: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, teamId) {
            var numberTeamId = Number(teamId);
            var operation = new getTeamModificationPermissionsOperation_1.GetTeamModificationPermissionsOperation(numberTeamId, request.user.id);
            operation.execute()
                .then(function (_permissions) {
                response.status(statusCode_1.StatusCode.OK).send(_permissions);
            }, function (_error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)) {
                    statusCode = statusCode_1.StatusCode.BAD_REQUEST;
                }
                response.status(statusCode).send();
            });
        }],
    get_skillModificationPermissions_skillId: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, skillId) {
            var numberSkillId = Number(skillId);
            var operation = new getSkillModificationPermissionsOperation_1.GetSkillModificationPermissionsOperation(numberSkillId, request.user.id);
            operation.execute()
                .then(function (_permissions) {
                response.status(statusCode_1.StatusCode.OK).send(_permissions);
            }, function (_error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)) {
                    statusCode = statusCode_1.StatusCode.BAD_REQUEST;
                }
                response.status(statusCode).send();
            });
        }]
};
//# sourceMappingURL=userController.js.map