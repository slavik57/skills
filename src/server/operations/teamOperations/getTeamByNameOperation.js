"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetTeamByNameOperation = (function (_super) {
    __extends(GetTeamByNameOperation, _super);
    function GetTeamByNameOperation(name) {
        _super.call(this);
        this.name = name;
    }
    GetTeamByNameOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.getTeamByName(this.name);
    };
    return GetTeamByNameOperation;
}(operationBase_1.OperationBase));
exports.GetTeamByNameOperation = GetTeamByNameOperation;
//# sourceMappingURL=getTeamByNameOperation.js.map