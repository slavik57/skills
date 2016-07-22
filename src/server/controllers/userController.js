"use strict";
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
    put_id_password: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, id) {
            var updateUserPassword = request.body;
            if (!userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, id)) {
                response.status(statusCode_1.StatusCode.UNAUTHORIZED).send();
                return;
            }
            var numberId = Number(id);
            var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(numberId, updateUserPassword.password, updateUserPassword.newPassword);
            operation.execute()
                .then(function () { return response.status(statusCode_1.StatusCode.OK).send(); }, function (error) {
                var statusCode = statusCode_1.StatusCode.BAD_REQUEST;
                if (error === 'Wrong password') {
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
                var permissionsNames = _.map(permissions, function (_permission) { return globalPermission_1.GlobalPermission[_permission]; });
                response.send(permissionsNames);
            });
        }]
};
//# sourceMappingURL=userController.js.map