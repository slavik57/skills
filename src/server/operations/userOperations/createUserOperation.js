"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
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
        var readerPermissions = [globalPermission_1.GlobalPermission.READER];
        var userInfo = {
            username: this._username,
            password_hash: this.hashThePassword(),
            email: this._email,
            firstName: this._firstName,
            lastName: this._lastName
        };
        return userDataHandler_1.UserDataHandler.createUserWithPermissions(userInfo, readerPermissions);
    };
    CreateUserOperation.prototype.hashThePassword = function () {
        return passwordHash.generate(this._password);
    };
    return CreateUserOperation;
}(operationBase_1.OperationBase));
exports.CreateUserOperation = CreateUserOperation;
//# sourceMappingURL=createUserOperation.js.map