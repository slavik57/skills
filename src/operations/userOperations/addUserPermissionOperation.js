"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modifyUserPermissionsOperationBase_1 = require("../base/modifyUserPermissionsOperationBase");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var AddUserPermissionOperation = (function (_super) {
    __extends(AddUserPermissionOperation, _super);
    function AddUserPermissionOperation(_userIdToAddPermissionsTo, _permissionsToAdd, executingUserId) {
        _super.call(this, _userIdToAddPermissionsTo, _permissionsToAdd, executingUserId);
        this._userIdToAddPermissionsTo = _userIdToAddPermissionsTo;
        this._permissionsToAdd = _permissionsToAdd;
    }
    AddUserPermissionOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.addGlobalPermissions(this._userIdToAddPermissionsTo, this._permissionsToAdd);
    };
    return AddUserPermissionOperation;
}(modifyUserPermissionsOperationBase_1.ModifyUserPermissionsOperationBase));
exports.AddUserPermissionOperation = AddUserPermissionOperation;
//# sourceMappingURL=addUserPermissionOperation.js.map