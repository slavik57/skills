"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetUserPermissionsOperation = (function (_super) {
    __extends(GetUserPermissionsOperation, _super);
    function GetUserPermissionsOperation(_userId) {
        _super.call(this);
        this._userId = _userId;
    }
    GetUserPermissionsOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(this._userId);
    };
    return GetUserPermissionsOperation;
}(operationBase_1.OperationBase));
exports.GetUserPermissionsOperation = GetUserPermissionsOperation;
//# sourceMappingURL=getUserPermissionsOperation.js.map