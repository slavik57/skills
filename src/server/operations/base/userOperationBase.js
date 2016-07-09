"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("./operationBase");
var bluebirdPromise = require('bluebird');
var UserOperationBase = (function (_super) {
    __extends(UserOperationBase, _super);
    function UserOperationBase() {
        _super.call(this);
    }
    UserOperationBase.prototype.checkUsernameDoesNotExist = function (username) {
        return userDataHandler_1.UserDataHandler.getUserByUsername(username)
            .then(function (user) {
            if (user) {
                return bluebirdPromise.reject('The username is taken');
            }
            return bluebirdPromise.resolve();
        });
    };
    UserOperationBase.prototype.checkEmailDoesNotExist = function (email) {
        if (!email) {
            return bluebirdPromise.resolve();
        }
        return userDataHandler_1.UserDataHandler.getUserByEmail(email)
            .then(function (user) {
            if (user) {
                return bluebirdPromise.reject('The email is taken');
            }
            return bluebirdPromise.resolve();
        });
    };
    return UserOperationBase;
}(operationBase_1.OperationBase));
exports.UserOperationBase = UserOperationBase;
//# sourceMappingURL=userOperationBase.js.map