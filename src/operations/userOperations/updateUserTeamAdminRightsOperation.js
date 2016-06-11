"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var teamOperationBase_1 = require("../base/teamOperationBase");
var UpdateUserTeamAdminRightsOperation = (function (_super) {
    __extends(UpdateUserTeamAdminRightsOperation, _super);
    function UpdateUserTeamAdminRightsOperation(_userIdToModify, _teamId, _shouldBeAdmin, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
        this._userIdToModify = _userIdToModify;
        this._shouldBeAdmin = _shouldBeAdmin;
    }
    Object.defineProperty(UpdateUserTeamAdminRightsOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    UpdateUserTeamAdminRightsOperation.canUpdateUserRights = function (teamId, executingUserId) {
        return new UpdateUserTeamAdminRightsOperation(-1, teamId, false, executingUserId).canExecute();
    };
    UpdateUserTeamAdminRightsOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.setAdminRights(this.teamId, this._userIdToModify, this._shouldBeAdmin);
    };
    return UpdateUserTeamAdminRightsOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.UpdateUserTeamAdminRightsOperation = UpdateUserTeamAdminRightsOperation;
