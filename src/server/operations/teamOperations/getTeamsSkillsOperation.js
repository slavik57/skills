"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetTeamsSkillsOperation = (function (_super) {
    __extends(GetTeamsSkillsOperation, _super);
    function GetTeamsSkillsOperation() {
        _super.call(this);
    }
    GetTeamsSkillsOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.getSkillsOfTeams();
    };
    return GetTeamsSkillsOperation;
}(operationBase_1.OperationBase));
exports.GetTeamsSkillsOperation = GetTeamsSkillsOperation;
//# sourceMappingURL=getTeamsSkillsOperation.js.map