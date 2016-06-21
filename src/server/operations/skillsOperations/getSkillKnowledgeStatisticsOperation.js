"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var bluebirdPromise = require('bluebird');
var GetSkillKnowledgeStatisticsOperation = (function (_super) {
    __extends(GetSkillKnowledgeStatisticsOperation, _super);
    function GetSkillKnowledgeStatisticsOperation(_skillId) {
        _super.call(this);
        this._skillId = _skillId;
    }
    GetSkillKnowledgeStatisticsOperation.prototype.doWork = function () {
        var _this = this;
        var numberOfTeamsPromise = teamsDataHandler_1.TeamsDataHandler.getNumberOfTeams();
        var skillTeamsPromise = skillsDataHandler_1.SkillsDataHandler.getTeams(this._skillId);
        return bluebirdPromise.all([skillTeamsPromise, numberOfTeamsPromise])
            .then(function (result) {
            return _this._calculateSkillsKnowledgeStatistics(result[0], result[1]);
        });
    };
    GetSkillKnowledgeStatisticsOperation.prototype._calculateSkillsKnowledgeStatistics = function (skillTeams, numberOfTeams) {
        var numberOfKnowingTeams = skillTeams.length;
        return {
            numberOfKnowingTeams: numberOfKnowingTeams,
            numberOfNotKnowingTeams: numberOfTeams - numberOfKnowingTeams
        };
    };
    return GetSkillKnowledgeStatisticsOperation;
}(operationBase_1.OperationBase));
exports.GetSkillKnowledgeStatisticsOperation = GetSkillKnowledgeStatisticsOperation;
//# sourceMappingURL=getSkillKnowledgeStatisticsOperation.js.map