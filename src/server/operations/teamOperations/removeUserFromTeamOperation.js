"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var addRemoveUserFromTeamOperationBase_1 = require("../base/addRemoveUserFromTeamOperationBase");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var RemoveUserFromTeamOperation = (function (_super) {
    __extends(RemoveUserFromTeamOperation, _super);
    function RemoveUserFromTeamOperation(_userIdToRemove, _teamId, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
        this._userIdToRemove = _userIdToRemove;
    }
    RemoveUserFromTeamOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.removeTeamMember(this.teamId, this._userIdToRemove);
    };
    return RemoveUserFromTeamOperation;
}(addRemoveUserFromTeamOperationBase_1.AddRemoveUserFromTeamOperationBase));
exports.RemoveUserFromTeamOperation = RemoveUserFromTeamOperation;
//# sourceMappingURL=removeUserFromTeamOperation.js.map