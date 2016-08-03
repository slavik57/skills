"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var authenticatedOperationBase_1 = require("../base/authenticatedOperationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var ModifyTeamOperationBase = (function (_super) {
    __extends(ModifyTeamOperationBase, _super);
    function ModifyTeamOperationBase(executingUserId) {
        _super.call(this, executingUserId);
    }
    Object.defineProperty(ModifyTeamOperationBase.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    return ModifyTeamOperationBase;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.ModifyTeamOperationBase = ModifyTeamOperationBase;
//# sourceMappingURL=modifyTeamOperationBase.js.map