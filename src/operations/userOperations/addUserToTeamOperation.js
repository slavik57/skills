"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamOperationBase_1 = require("../base/teamOperationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var AddUserToTeamOperation = (function (_super) {
    __extends(AddUserToTeamOperation, _super);
    function AddUserToTeamOperation(_userIdToAdd, _teamId, _shouldBeAdmin, _executingUserId) {
        _super.call(this, _executingUserId, _teamId);
        this._userIdToAdd = _userIdToAdd;
        this._shouldBeAdmin = _shouldBeAdmin;
    }
    AddUserToTeamOperation.prototype.canExecute = function () {
        return _super.prototype.canExecute.call(this);
    };
    Object.defineProperty(AddUserToTeamOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    AddUserToTeamOperation.prototype.doWork = function () {
        var teamMemberInfo = {
            team_id: this.teamId,
            user_id: this._userIdToAdd,
            is_admin: this._shouldBeAdmin
        };
        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
    };
    return AddUserToTeamOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.AddUserToTeamOperation = AddUserToTeamOperation;
