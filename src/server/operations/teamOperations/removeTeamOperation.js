"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var authenticatedOperationBase_1 = require("../base/authenticatedOperationBase");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var RemoveTeamOperation = (function (_super) {
    __extends(RemoveTeamOperation, _super);
    function RemoveTeamOperation(_teamIdToRemove, executingUserId) {
        _super.call(this, executingUserId);
        this._teamIdToRemove = _teamIdToRemove;
    }
    Object.defineProperty(RemoveTeamOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    RemoveTeamOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.deleteTeam(this._teamIdToRemove);
    };
    return RemoveTeamOperation;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.RemoveTeamOperation = RemoveTeamOperation;
//# sourceMappingURL=removeTeamOperation.js.map