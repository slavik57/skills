"use strict";
var statusCode_1 = require("../enums/statusCode");
var Authenticator = (function () {
    function Authenticator() {
    }
    Authenticator.ensureAuthenticated = function (request, response, nextFunction) {
        if (request.isAuthenticated()) {
            nextFunction();
            return;
        }
        response.status(statusCode_1.StatusCode.UNAUTHORIZED).send();
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;
//# sourceMappingURL=authenticator.js.map