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
var CreateAdminUserOperation = (function (_super) {
    __extends(CreateAdminUserOperation, _super);
    function CreateAdminUserOperation() {
        _super.call(this);
        this._username = 'admin';
        this._password = 'admin';
        this._email = null;
        this._firstName = 'admin';
        this._lastName = 'admin';
    }
    CreateAdminUserOperation.prototype.doWork = function () {
        var adminPermissions = [globalPermission_1.GlobalPermission.ADMIN];
        var userInfo = {
            username: this._username,
            password_hash: this.hashThePassword(),
            email: this._email,
            firstName: this._firstName,
            lastName: this._lastName
        };
        return userDataHandler_1.UserDataHandler.createUserWithPermissions(userInfo, adminPermissions);
    };
    CreateAdminUserOperation.prototype.hashThePassword = function () {
        return passwordHash.generate(this._password);
    };
    return CreateAdminUserOperation;
}(operationBase_1.OperationBase));
exports.CreateAdminUserOperation = CreateAdminUserOperation;
//# sourceMappingURL=createAdminUserOperation.js.map