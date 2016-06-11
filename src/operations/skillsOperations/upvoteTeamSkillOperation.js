"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var authenticatedOperationBase_1 = require("../base/authenticatedOperationBase");
var _ = require('lodash');
var UpvoteTeamSkillOperation = (function (_super) {
    __extends(UpvoteTeamSkillOperation, _super);
    function UpvoteTeamSkillOperation(_skillIdToUpvote, _teamId, executingUserId) {
        _super.call(this, executingUserId);
        this._skillIdToUpvote = _skillIdToUpvote;
        this._teamId = _teamId;
    }
    Object.defineProperty(UpvoteTeamSkillOperation.prototype, "sufficientOperationGlobalPermissions", {
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
    UpvoteTeamSkillOperation.prototype.doWork = function () {
        var _this = this;
        return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(this._teamId)
            .then(function (_teamSkills) {
            return _this._upvoteTeamSkill(_teamSkills);
        });
    };
    UpvoteTeamSkillOperation.prototype._upvoteTeamSkill = function (teamSkills) {
        var _this = this;
        var teamSkill = _.find(teamSkills, function (_teamSkill) { return _teamSkill.skill.id === _this._skillIdToUpvote; });
        if (!teamSkill) {
            return Promise.reject('The skill is not part of the team skills');
        }
        return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill.teamSkill.id, this.executingUserId);
    };
    return UpvoteTeamSkillOperation;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.UpvoteTeamSkillOperation = UpvoteTeamSkillOperation;
