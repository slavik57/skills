"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamOperationBase_1 = require("./teamOperationBase");
var AddRemoveUserFromTeamOperationBase = (function (_super) {
    __extends(AddRemoveUserFromTeamOperationBase, _super);
    function AddRemoveUserFromTeamOperationBase(_teamId, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
    }
    Object.defineProperty(AddRemoveUserFromTeamOperationBase.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    return AddRemoveUserFromTeamOperationBase;
}(teamOperationBase_1.TeamOperationBase));
exports.AddRemoveUserFromTeamOperationBase = AddRemoveUserFromTeamOperationBase;
//# sourceMappingURL=addRemoveUserFromTeamOperationBase.js.map