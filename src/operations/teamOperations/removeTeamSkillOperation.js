"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var teamOperationBase_1 = require("../base/teamOperationBase");
var RemoveTeamSkillOperation = (function (_super) {
    __extends(RemoveTeamSkillOperation, _super);
    function RemoveTeamSkillOperation(_skillIdToRemove, teamId, executingUserId) {
        _super.call(this, teamId, executingUserId);
        this._skillIdToRemove = _skillIdToRemove;
    }
    Object.defineProperty(RemoveTeamSkillOperation.prototype, "isRegularTeamMemberAlowedToExecute", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    RemoveTeamSkillOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(this.teamId, this._skillIdToRemove);
    };
    return RemoveTeamSkillOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.RemoveTeamSkillOperation = RemoveTeamSkillOperation;
