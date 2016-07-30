"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var unauthorizedError_1 = require("../../../common/errors/unauthorizedError");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var userOperationBase_1 = require("../base/userOperationBase");
var bluebirdPromise = require('bluebird');
var passwordHash = require('password-hash');
var UpdateUserPasswordOperation = (function (_super) {
    __extends(UpdateUserPasswordOperation, _super);
    function UpdateUserPasswordOperation(userId, userPassword, newUserPassword, executingUserId) {
        _super.call(this);
        this.userId = userId;
        this.userPassword = userPassword;
        this.newUserPassword = newUserPassword;
        this.executingUserId = executingUserId;
        this._shouldCheckUserPassword = true;
    }
    UpdateUserPasswordOperation.prototype.canExecute = function () {
        var _this = this;
        if (!this.newUserPassword) {
            return bluebirdPromise.reject('The new password cannot be empty');
        }
        if (this.userId === this.executingUserId) {
            return bluebirdPromise.resolve();
        }
        return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(this.executingUserId)
            .then(function (_permissions) {
            if (_permissions.indexOf(globalPermission_1.GlobalPermission.ADMIN) >= 0) {
                _this._shouldCheckUserPassword = false;
                return bluebirdPromise.resolve();
            }
            else {
                return bluebirdPromise.reject(new unauthorizedError_1.UnauthorizedError());
            }
        });
    };
    UpdateUserPasswordOperation.prototype.doWork = function () {
        var _this = this;
        var newPasswordHash = passwordHash.generate(this.newUserPassword);
        var user;
        return userDataHandler_1.UserDataHandler.getUser(this.userId)
            .then(function (_user) {
            user = _user;
        })
            .then(function () { return _this._checkUserPassword(user); })
            .then(function () { return userDataHandler_1.UserDataHandler.updateUserPassword(_this.userId, newPasswordHash); })
            .catch(function (_error) { return _this._handleError(user, _error); });
    };
    UpdateUserPasswordOperation.prototype._checkUserPassword = function (user) {
        if (this._shouldCheckUserPassword &&
            !passwordHash.verify(this.userPassword, user.attributes.password_hash)) {
            return bluebirdPromise.reject('Wrong password');
        }
        return bluebirdPromise.resolve();
    };
    UpdateUserPasswordOperation.prototype._handleError = function (user, error) {
        if (!user) {
            return bluebirdPromise.reject('Something went wrong');
        }
        else {
            return bluebirdPromise.reject(error);
        }
    };
    return UpdateUserPasswordOperation;
}(userOperationBase_1.UserOperationBase));
exports.UpdateUserPasswordOperation = UpdateUserPasswordOperation;
//# sourceMappingURL=updateUserPasswordOperation.js.map