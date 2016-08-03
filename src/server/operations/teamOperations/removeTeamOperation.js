"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modifyTeamOperationBase_1 = require("../base/modifyTeamOperationBase");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var RemoveTeamOperation = (function (_super) {
    __extends(RemoveTeamOperation, _super);
    function RemoveTeamOperation(_teamIdToRemove, executingUserId) {
        _super.call(this, executingUserId);
        this._teamIdToRemove = _teamIdToRemove;
    }
    RemoveTeamOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.deleteTeam(this._teamIdToRemove);
    };
    return RemoveTeamOperation;
}(modifyTeamOperationBase_1.ModifyTeamOperationBase));
exports.RemoveTeamOperation = RemoveTeamOperation;
//# sourceMappingURL=removeTeamOperation.js.map