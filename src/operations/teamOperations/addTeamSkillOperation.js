"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamOperationBase_1 = require("../base/teamOperationBase");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var AddTeamSkillOperation = (function (_super) {
    __extends(AddTeamSkillOperation, _super);
    function AddTeamSkillOperation(_skillIdToAdd, teamId, executingUserId) {
        _super.call(this, teamId, executingUserId);
        this._skillIdToAdd = _skillIdToAdd;
    }
    Object.defineProperty(AddTeamSkillOperation.prototype, "isRegularTeamMemberAlowedToExecute", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    AddTeamSkillOperation.prototype.doWork = function () {
        var teamSkillInfo = {
            team_id: this.teamId,
            skill_id: this._skillIdToAdd
        };
        return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
    };
    return AddTeamSkillOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.AddTeamSkillOperation = AddTeamSkillOperation;
