"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetUsersByPartialUsernameOperation = (function (_super) {
    __extends(GetUsersByPartialUsernameOperation, _super);
    function GetUsersByPartialUsernameOperation(partialUsername) {
        _super.call(this);
        this.partialUsername = partialUsername;
    }
    GetUsersByPartialUsernameOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.getUsersByPartialUsername(this.partialUsername);
    };
    return GetUsersByPartialUsernameOperation;
}(operationBase_1.OperationBase));
exports.GetUsersByPartialUsernameOperation = GetUsersByPartialUsernameOperation;
//# sourceMappingURL=getUsersByPartialUsernameOperation.js.map