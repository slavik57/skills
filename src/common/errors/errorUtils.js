"use strict";
var extendedError_1 = require("./extendedError");
var unauthorizedError_1 = require("./unauthorizedError");
var ErrorUtils = (function () {
    function ErrorUtils() {
    }
    ErrorUtils.IsUnautorizedError = function (error) {
        if (error instanceof unauthorizedError_1.UnauthorizedError) {
            return true;
        }
        while (error instanceof extendedError_1.ExtendedError) {
            error = error.innerError;
            if (error instanceof unauthorizedError_1.UnauthorizedError) {
                return true;
            }
        }
        return false;
    };
    return ErrorUtils;
}());
exports.ErrorUtils = ErrorUtils;
//# sourceMappingURL=errorUtils.js.map