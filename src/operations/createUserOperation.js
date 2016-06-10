"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var operationBase_1 = require("./base/operationBase");
var CreateUserOperation = (function (_super) {
    __extends(CreateUserOperation, _super);
    function CreateUserOperation(_userInfo) {
        _super.call(this);
        this._userInfo = _userInfo;
    }
    Object.defineProperty(CreateUserOperation.prototype, "userInfo", {
        get: function () { return this._userInfo; },
        enumerable: true,
        configurable: true
    });
    CreateUserOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.createUser(this._userInfo);
    };
    return CreateUserOperation;
}(operationBase_1.OperationBase));
exports.CreateUserOperation = CreateUserOperation;
