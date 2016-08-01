"use strict";
var extendedError_1 = require("./extendedError");
var ErrorUtils = (function () {
    function ErrorUtils() {
    }
    ErrorUtils.isErrorOfType = function (error, type) {
        if (error instanceof type) {
            return true;
        }
        while (error instanceof extendedError_1.ExtendedError) {
            error = error.innerError;
            if (error instanceof type) {
                return true;
            }
        }
        return false;
    };
    return ErrorUtils;
}());
exports.ErrorUtils = ErrorUtils;
//# sourceMappingURL=errorUtils.js.map