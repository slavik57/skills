"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var passwordHash = require('password-hash');
var bluebirdPromise = require('bluebird');
var LoginUserOperation = (function (_super) {
    __extends(LoginUserOperation, _super);
    function LoginUserOperation(_username, _passwrod) {
        _super.call(this);
        this._username = _username;
        this._passwrod = _passwrod;
    }
    LoginUserOperation.prototype.doWork = function () {
        var _this = this;
        return this._getUser()
            .then(function (_user) { return _this._verifyPassword(_user); });
    };
    LoginUserOperation.prototype._getUser = function () {
        return userDataHandler_1.UserDataHandler.getUserByUsername(this._username)
            .then(function (_user) {
            if (!_user) {
                return bluebirdPromise.reject('Invalid username');
            }
            return _user;
        });
    };
    LoginUserOperation.prototype._verifyPassword = function (user) {
        var isCorrectPassword = passwordHash.verify(this._passwrod, user.attributes.password_hash);
        if (isCorrectPassword) {
            return bluebirdPromise.resolve(user);
        }
        else {
            return bluebirdPromise.reject('Incorrect password');
        }
    };
    return LoginUserOperation;
}(operationBase_1.OperationBase));
exports.LoginUserOperation = LoginUserOperation;
//# sourceMappingURL=loginUserOperation.js.map