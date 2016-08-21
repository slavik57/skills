"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var notFoundError_1 = require("../../../common/errors/notFoundError");
var globalPermission_1 = require("../../models/enums/globalPermission");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var teamOperationBase_1 = require("../base/teamOperationBase");
var bluebirdPromise = require('bluebird');
var _ = require('lodash');
var UpdateUserTeamAdminRightsOperation = (function (_super) {
    __extends(UpdateUserTeamAdminRightsOperation, _super);
    function UpdateUserTeamAdminRightsOperation(_userIdToModify, _teamId, _shouldBeAdmin, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
        this._userIdToModify = _userIdToModify;
        this._shouldBeAdmin = _shouldBeAdmin;
    }
    Object.defineProperty(UpdateUserTeamAdminRightsOperation.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    UpdateUserTeamAdminRightsOperation.canUpdateUserRights = function (teamId, executingUserId) {
        return new UpdateUserTeamAdminRightsOperation(-1, teamId, false, executingUserId).canExecute();
    };
    UpdateUserTeamAdminRightsOperation.prototype.doWork = function () {
        var _this = this;
        return this._verifyUserExists()
            .then(function () { return teamsDataHandler_1.TeamsDataHandler.setAdminRights(_this.teamId, _this._userIdToModify, _this._shouldBeAdmin); });
    };
    UpdateUserTeamAdminRightsOperation.prototype._verifyUserExists = function () {
        return this._getTeamMemberToModify()
            .then(function (_teamMember) {
            if (_teamMember) {
                return bluebirdPromise.resolve();
            }
            else {
                var error = new notFoundError_1.NotFoundError();
                error.message = 'The user is not in the team';
                return bluebirdPromise.reject(error);
            }
        });
    };
    UpdateUserTeamAdminRightsOperation.prototype._getTeamMemberToModify = function () {
        var _this = this;
        return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(this.teamId)
            .then(function (_teamMembers) {
            return _.find(_teamMembers, function (_member) { return _member.user.id === _this._userIdToModify; });
        });
    };
    return UpdateUserTeamAdminRightsOperation;
}(teamOperationBase_1.TeamOperationBase));
exports.UpdateUserTeamAdminRightsOperation = UpdateUserTeamAdminRightsOperation;
//# sourceMappingURL=updateUserTeamAdminRightsOperation.js.map