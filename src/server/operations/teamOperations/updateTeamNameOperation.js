"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var teamOperationBase_1 = require("../base/teamOperationBase");
var bluebirdPromise = require('bluebird');
var UpdateTeamNameOperation = (function (_super) {
    __extends(UpdateTeamNameOperation, _super);
    function UpdateTeamNameOperation(teamId, newTeamName, executingUserId) {
        _super.call(this, teamId, executingUserId);
        this.newTeamName = newTeamName;
    }
    UpdateTeamNameOperation.prototype.doWork = function () {
        var _this = this;
        var team;
        return this._checkTeamNameNotExist()
            .then(function () { return teamsDataHandler_1.TeamsDataHandler.updateTeamName(_this.teamId, _this.newTeamName); });
    };
    Object.defineProperty(UpdateTeamNameOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    UpdateTeamNameOperation.prototype._checkTeamNameNotExist = function () {
        var _this = this;
        return teamsDataHandler_1.TeamsDataHandler.getTeamByName(this.newTeamName)
            .then(function (_team) {
            if (!!_team &&
                _team.id !== _this.teamId) {
                var error = new alreadyExistsError_1.AlreadyExistsError();
                error.message = 'The team name is taken';
                return bluebirdPromise.reject(error);
            }
        });
    };
    return UpdateTeamNameOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.UpdateTeamNameOperation = UpdateTeamNameOperation;
//# sourceMappingURL=updateTeamNameOperation.js.map