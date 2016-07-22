"use strict";
(function (StatusCode) {
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["REDIRECT"] = 302] = "REDIRECT";
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
})(exports.StatusCode || (exports.StatusCode = {}));
var StatusCode = exports.StatusCode;
//# sourceMappingURL=statusCode.js.map