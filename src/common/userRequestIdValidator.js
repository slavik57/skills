"use strict";
var UserRequestIdValidator = (function () {
    function UserRequestIdValidator() {
    }
    UserRequestIdValidator.isRequestFromUser = function (request, userId) {
        return !!request &&
            !!request.user &&
            !!request.user.id &&
            request.user.id.toString() === userId;
    };
    return UserRequestIdValidator;
}());
exports.UserRequestIdValidator = UserRequestIdValidator;
//# sourceMappingURL=userRequestIdValidator.js.map