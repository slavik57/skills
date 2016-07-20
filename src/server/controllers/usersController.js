"use strict";
var getUsersByPartialUsernameOperation_1 = require("../operations/userOperations/getUsersByPartialUsernameOperation");
var getUsersOperation_1 = require("../operations/userOperations/getUsersOperation");
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
                response.json(_userInfoResponses);
            });
        }],
    get_filtered_username: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, username) {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(username);
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
        }]
};
//# sourceMappingURL=usersController.js.map