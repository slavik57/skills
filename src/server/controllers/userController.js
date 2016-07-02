"use strict";
var authenticator_1 = require("../expressMiddlewares/authenticator");
var getUserOperation_1 = require("../operations/userOperations/getUserOperation");
module.exports = {
    get_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            response.json(request.user);
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
    }
};
//# sourceMappingURL=userController.js.map