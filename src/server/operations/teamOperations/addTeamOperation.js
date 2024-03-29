"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modifyTeamOperationBase_1 = require("../base/modifyTeamOperationBase");
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var bluebirdPromise = require('bluebird');
var AddTeamOperation = (function (_super) {
    __extends(AddTeamOperation, _super);
    function AddTeamOperation(_teamInfo, executingUserId) {
        _super.call(this, executingUserId);
        this._teamInfo = _teamInfo;
    }
    AddTeamOperation.prototype.canExecute = function () {
        var _this = this;
        return _super.prototype.canExecute.call(this)
            .then(function () { return _this._checkIfTeamAlreadyExists(); }, function (_error) { return bluebirdPromise.reject(_error); });
    };
    AddTeamOperation.prototype.doWork = function () {
        return teamsDataHandler_1.TeamsDataHandler.createTeam(this._teamInfo, this.executingUserId);
    };
    AddTeamOperation.prototype._checkIfTeamAlreadyExists = function () {
        var _this = this;
        return teamsDataHandler_1.TeamsDataHandler.getTeamByName(this._teamInfo.name)
            .then(function (_team) {
            if (!_team) {
                return bluebirdPromise.resolve();
            }
            var error = new alreadyExistsError_1.AlreadyExistsError();
            error.message = 'Team with the name ' + _this._teamInfo.name + ' already exists';
            return bluebirdPromise.reject(error);
        }, function () {
            return bluebirdPromise.resolve();
        });
    };
    return AddTeamOperation;
}(modifyTeamOperationBase_1.ModifyTeamOperationBase));
exports.AddTeamOperation = AddTeamOperation;
//# sourceMappingURL=addTeamOperation.js.map