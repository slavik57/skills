"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modifyUserPermissionsOperationBase_1 = require("../base/modifyUserPermissionsOperationBase");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var _ = require('lodash');
var UpdateUserPermissionsOperation = (function (_super) {
    __extends(UpdateUserPermissionsOperation, _super);
    function UpdateUserPermissionsOperation(userIdToModifyPermissionsOf, _permissionsToAdd, _permissionsToRemove, executingUserId) {
        _super.call(this, userIdToModifyPermissionsOf, _.union(_permissionsToAdd, _permissionsToRemove), executingUserId);
        this._permissionsToAdd = _permissionsToAdd;
        this._permissionsToRemove = _permissionsToRemove;
    }
    UpdateUserPermissionsOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.updateGlobalPermissions(this.userIdToModifyPermissionsOf, this._permissionsToAdd, this._permissionsToRemove);
    };
    return UpdateUserPermissionsOperation;
}(modifyUserPermissionsOperationBase_1.ModifyUserPermissionsOperationBase));
exports.UpdateUserPermissionsOperation = UpdateUserPermissionsOperation;
//# sourceMappingURL=updateUserPermissionsOperation.js.map