"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetUserByIdOperation = (function (_super) {
    __extends(GetUserByIdOperation, _super);
    function GetUserByIdOperation(id) {
        _super.call(this);
        this.id = id;
    }
    GetUserByIdOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.getUser(this.id);
    };
    return GetUserByIdOperation;
}(operationBase_1.OperationBase));
exports.GetUserByIdOperation = GetUserByIdOperation;
//# sourceMappingURL=getUserByIdOperation.js.map