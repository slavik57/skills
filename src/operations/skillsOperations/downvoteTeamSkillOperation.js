"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var authenticatedOperationBase_1 = require("../base/authenticatedOperationBase");
var _ = require('lodash');
var DownvoteTeamSkillOperation = (function (_super) {
    __extends(DownvoteTeamSkillOperation, _super);
    function DownvoteTeamSkillOperation(_skillIdToDownvote, _teamId, executingUserId) {
        _super.call(this, executingUserId);
        this._skillIdToDownvote = _skillIdToDownvote;
        this._teamId = _teamId;
    }
    Object.defineProperty(DownvoteTeamSkillOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [
                globalPermission_1.GlobalPermission.READER,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
            ];
        },
        enumerable: true,
        configurable: true
    });
    DownvoteTeamSkillOperation.prototype.doWork = function () {
        var _this = this;
        return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(this._teamId)
            .then(function (_teamSkills) {
            return _this._downvoteTeamSkill(_teamSkills);
        });
    };
    DownvoteTeamSkillOperation.prototype._downvoteTeamSkill = function (teamSkills) {
        var _this = this;
        var teamSkill = _.find(teamSkills, function (_teamSkill) { return _teamSkill.skill.id === _this._skillIdToDownvote; });
        if (!teamSkill) {
            return Promise.reject('The skill is not part of the team skills');
        }
        return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkill.teamSkill.id, this.executingUserId);
    };
    return DownvoteTeamSkillOperation;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.DownvoteTeamSkillOperation = DownvoteTeamSkillOperation;
