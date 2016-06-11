"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetTeamSkillsOperation = (function (_super) {
    __extends(GetTeamSkillsOperation, _super);
    function GetTeamSkillsOperation(_teamId) {
        _super.call(this);
        this._teamId = _teamId;
    }
    GetTeamSkillsOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(this._teamId);
    };
    return GetTeamSkillsOperation;
}(operationBase_1.OperationBase));
exports.GetTeamSkillsOperation = GetTeamSkillsOperation;
