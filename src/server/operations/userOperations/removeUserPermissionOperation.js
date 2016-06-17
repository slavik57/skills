"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var modifyUserPermissionsOperationBase_1 = require("../base/modifyUserPermissionsOperationBase");
var RemoveUserPermissionOperation = (function (_super) {
    __extends(RemoveUserPermissionOperation, _super);
    function RemoveUserPermissionOperation(_userIdToRemovePermissionsFrom, _permissionsToRemove, executingUserId) {
        _super.call(this, _userIdToRemovePermissionsFrom, _permissionsToRemove, executingUserId);
        this._userIdToRemovePermissionsFrom = _userIdToRemovePermissionsFrom;
        this._permissionsToRemove = _permissionsToRemove;
    }
    RemoveUserPermissionOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.removeGlobalPermissions(this._userIdToRemovePermissionsFrom, this._permissionsToRemove);
    };
    return RemoveUserPermissionOperation;
}(modifyUserPermissionsOperationBase_1.ModifyUserPermissionsOperationBase));
exports.RemoveUserPermissionOperation = RemoveUserPermissionOperation;
//# sourceMappingURL=removeUserPermissionOperation.js.map