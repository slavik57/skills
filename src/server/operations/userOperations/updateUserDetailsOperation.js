"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userOperationBase_1 = require("../base/userOperationBase");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var bluebirdPromise = require('bluebird');
var UpdateUserDetailsOperation = (function (_super) {
    __extends(UpdateUserDetailsOperation, _super);
    function UpdateUserDetailsOperation(_userId, _username, _email, _firstName, _lastName) {
        _super.call(this);
        this._userId = _userId;
        this._username = _username;
        this._email = _email;
        this._firstName = _firstName;
        this._lastName = _lastName;
    }
    UpdateUserDetailsOperation.prototype.doWork = function () {
        var _this = this;
        var user;
        return userDataHandler_1.UserDataHandler.getUser(this._userId)
            .then(function (_user) {
            user = _user;
        })
            .then(function () { return _this._checkUsernameDoesNotExist(user); })
            .then(function () { return _this._checkEmailDoesNotExist(user); })
            .then(function () { return userDataHandler_1.UserDataHandler.updateUserDetails(_this._userId, _this._username, _this._email, _this._firstName, _this._lastName); });
    };
    UpdateUserDetailsOperation.prototype._checkUsernameDoesNotExist = function (user) {
        if (user.attributes.username !== this._username) {
            return this.checkUsernameDoesNotExist(this._username);
        }
        return bluebirdPromise.resolve();
    };
    UpdateUserDetailsOperation.prototype._checkEmailDoesNotExist = function (user) {
        if (user.attributes.email !== this._email) {
            return this.checkEmailDoesNotExist(this._email);
        }
        return bluebirdPromise.resolve();
    };
    return UpdateUserDetailsOperation;
}(userOperationBase_1.UserOperationBase));
exports.UpdateUserDetailsOperation = UpdateUserDetailsOperation;
//# sourceMappingURL=updateUserDetailsOperation.js.map