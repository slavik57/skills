"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetUserOperation = (function (_super) {
    __extends(GetUserOperation, _super);
    function GetUserOperation(username) {
        _super.call(this);
        this.username = username;
    }
    GetUserOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.getUserByUsername(this.username);
    };
    return GetUserOperation;
}(operationBase_1.OperationBase));
exports.GetUserOperation = GetUserOperation;
//# sourceMappingURL=getUserOperation.js.map