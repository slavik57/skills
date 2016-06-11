"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var authenticatedOperationBase_1 = require("../base/authenticatedOperationBase");
var AddTeamOperation = (function (_super) {
    __extends(AddTeamOperation, _super);
    function AddTeamOperation(_teamInfo, executingUserId) {
        _super.call(this, executingUserId);
        this._teamInfo = _teamInfo;
    }
    Object.defineProperty(AddTeamOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    AddTeamOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.createTeam(this._teamInfo);
    };
    return AddTeamOperation;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.AddTeamOperation = AddTeamOperation;
