"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var teamOperationBase_1 = require("../base/teamOperationBase");
var RemoveUserFromTeamOperation = (function (_super) {
    __extends(RemoveUserFromTeamOperation, _super);
    function RemoveUserFromTeamOperation(_userIdToRemove, _teamId, _executingUserId) {
        _super.call(this, _executingUserId, _teamId);
        this._userIdToRemove = _userIdToRemove;
    }
    Object.defineProperty(RemoveUserFromTeamOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    RemoveUserFromTeamOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.removeTeamMember(this.teamId, this._userIdToRemove);
    };
    return RemoveUserFromTeamOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.RemoveUserFromTeamOperation = RemoveUserFromTeamOperation;
