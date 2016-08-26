"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetTeamByIdOperation = (function (_super) {
    __extends(GetTeamByIdOperation, _super);
    function GetTeamByIdOperation(teamId) {
        _super.call(this);
        this.teamId = teamId;
    }
    GetTeamByIdOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.getTeam(this.teamId);
    };
    return GetTeamByIdOperation;
}(operationBase_1.OperationBase));
exports.GetTeamByIdOperation = GetTeamByIdOperation;
//# sourceMappingURL=getTeamByIdOperation.js.map