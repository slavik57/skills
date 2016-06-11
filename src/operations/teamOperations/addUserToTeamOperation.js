"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var addRemoveUserFromTeamOperationBase_1 = require("../base/addRemoveUserFromTeamOperationBase");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var AddUserToTeamOperation = (function (_super) {
    __extends(AddUserToTeamOperation, _super);
    function AddUserToTeamOperation(_userIdToAdd, _teamId, _shouldBeAdmin, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
        this._userIdToAdd = _userIdToAdd;
        this._shouldBeAdmin = _shouldBeAdmin;
    }
    AddUserToTeamOperation.prototype.doWork = function () {
        var teamMemberInfo = {
            team_id: this.teamId,
            user_id: this._userIdToAdd,
            is_admin: this._shouldBeAdmin
        };
        return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
    };
    return AddUserToTeamOperation;
}(addRemoveUserFromTeamOperationBase_1.AddRemoveUserFromTeamOperationBase));
exports.AddUserToTeamOperation = AddUserToTeamOperation;
