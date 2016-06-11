"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamOperationBase_1 = require("./teamOperationBase");
var AddRemoveTeamSkillOperationBase = (function (_super) {
    __extends(AddRemoveTeamSkillOperationBase, _super);
    function AddRemoveTeamSkillOperationBase(_teamId, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
    }
    Object.defineProperty(AddRemoveTeamSkillOperationBase.prototype, "isRegularTeamMemberAlowedToExecute", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return AddRemoveTeamSkillOperationBase;
}(teamOperationBase_1.TeamOperationBase));
exports.AddRemoveTeamSkillOperationBase = AddRemoveTeamSkillOperationBase;
