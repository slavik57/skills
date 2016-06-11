"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetTeamUsersOperation = (function (_super) {
    __extends(GetTeamUsersOperation, _super);
    function GetTeamUsersOperation(_teamId) {
        _super.call(this);
        this._teamId = _teamId;
    }
    GetTeamUsersOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(this._teamId);
    };
    return GetTeamUsersOperation;
}(operationBase_1.OperationBase));
exports.GetTeamUsersOperation = GetTeamUsersOperation;
