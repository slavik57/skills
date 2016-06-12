"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillsKnowledgeStatisticsOperation = (function (_super) {
    __extends(GetSkillsKnowledgeStatisticsOperation, _super);
    function GetSkillsKnowledgeStatisticsOperation() {
        _super.call(this);
    }
    GetSkillsKnowledgeStatisticsOperation.prototype.doWork = function () {
        var _this = this;
        var numberOfTeamsPromise = teamsDataHandler_1.TeamsDataHandler.getNumberOfTeams();
        var teamsOfSkillsPromise = skillsDataHandler_1.SkillsDataHandler.getTeamsOfSkills();
        return Promise.all([teamsOfSkillsPromise, numberOfTeamsPromise])
            .then(function (result) {
            return _this._calculateSkillsKnowledgeStatistics(result[0], result[1]);
        });
    };
    GetSkillsKnowledgeStatisticsOperation.prototype._calculateSkillsKnowledgeStatistics = function (teamsOfSkills, numberOfTeams) {
        var result = [];
        teamsOfSkills.forEach(function (_teamsOfSkill) {
            var numberOKnowingTeams = _teamsOfSkill.teamsIds.length;
            result.push({
                skill: _teamsOfSkill.skill,
                numberOfKnowingTeams: numberOKnowingTeams,
                numberOfNotKnowingTeams: numberOfTeams - numberOKnowingTeams
            });
        });
        return result;
    };
    return GetSkillsKnowledgeStatisticsOperation;
}(operationBase_1.OperationBase));
exports.GetSkillsKnowledgeStatisticsOperation = GetSkillsKnowledgeStatisticsOperation;
