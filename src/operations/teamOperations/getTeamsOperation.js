"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetTeamsOperation = (function (_super) {
    __extends(GetTeamsOperation, _super);
    function GetTeamsOperation() {
        _super.call(this);
    }
    GetTeamsOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.getTeams();
    };
    return GetTeamsOperation;
}(operationBase_1.OperationBase));
exports.GetTeamsOperation = GetTeamsOperation;
