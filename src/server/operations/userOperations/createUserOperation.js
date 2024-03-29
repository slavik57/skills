"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userOperationBase_1 = require("../base/userOperationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var passwordHash = require('password-hash');
var CreateUserOperation = (function (_super) {
    __extends(CreateUserOperation, _super);
    function CreateUserOperation(_username, _password, _email, _firstName, _lastName) {
        _super.call(this);
        this._username = _username;
        this._password = _password;
        this._email = _email;
        this._firstName = _firstName;
        this._lastName = _lastName;
    }
    CreateUserOperation.prototype.doWork = function () {
        var _this = this;
        var readerPermissions = [globalPermission_1.GlobalPermission.READER];
        if (this._email === '') {
            this._email = undefined;
        }
        var userInfo = {
            username: this._username,
            password_hash: this.hashThePassword(),
            email: this._email,
            firstName: this._firstName,
            lastName: this._lastName
        };
        return this.checkUsernameDoesNotExist(this._username)
            .then(function () { return _this.checkEmailDoesNotExist(_this._email); })
            .then(function () { return userDataHandler_1.UserDataHandler.createUserWithPermissions(userInfo, readerPermissions); });
    };
    CreateUserOperation.prototype.hashThePassword = function () {
        return passwordHash.generate(this._password);
    };
    return CreateUserOperation;
}(userOperationBase_1.UserOperationBase));
exports.CreateUserOperation = CreateUserOperation;
//# sourceMappingURL=createUserOperation.js.map