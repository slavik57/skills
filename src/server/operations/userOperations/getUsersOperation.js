"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetUsersOperation = (function (_super) {
    __extends(GetUsersOperation, _super);
    function GetUsersOperation() {
        _super.call(this);
    }
    GetUsersOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.getUsers();
    };
    return GetUsersOperation;
}(operationBase_1.OperationBase));
exports.GetUsersOperation = GetUsersOperation;
//# sourceMappingURL=getUsersOperation.js.map