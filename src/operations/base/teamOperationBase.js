"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var authenticatedOperationBase_1 = require("./authenticatedOperationBase");
var TeamOperationBase = (function (_super) {
    __extends(TeamOperationBase, _super);
    function TeamOperationBase(_teamId, executingUserId) {
        _super.call(this, executingUserId);
        this._teamId = _teamId;
    }
    Object.defineProperty(TeamOperationBase.prototype, "teamId", {
        get: function () { return this._teamId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamOperationBase.prototype, "isRegularTeamMemberAlowedToExecute", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    TeamOperationBase.prototype.canExecute = function () {
        var _this = this;
        return _super.prototype.canExecute.call(this)
            .catch(function () { return _this._canExecuteBasedOnTeamMembership(); });
    };
    TeamOperationBase.prototype._canExecuteBasedOnTeamMembership = function () {
        var _this = this;
        var teamUsersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers(this._teamId);
        return teamUsersPromise.then(function (_teamUsers) { return _this._isUserInTheTeamAndHasSufficientAdminRights(_teamUsers); });
    };
    TeamOperationBase.prototype._isUserInTheTeamAndHasSufficientAdminRights = function (teamUsers) {
        for (var i = 0; i < teamUsers.length; i++) {
            var teamUser = teamUsers[i];
            var userId = teamUser.user.id;
            var isAdmin = teamUser.isAdmin;
            if (userId !== this.executingUserId) {
                continue;
            }
            return this._userHasSufficientAdminRights(isAdmin);
        }
        return Promise.reject('The user is not in the team');
    };
    TeamOperationBase.prototype._userHasSufficientAdminRights = function (isAdmin) {
        if (this.isRegularTeamMemberAlowedToExecute || isAdmin) {
            return Promise.resolve();
        }
        return Promise.reject('The user must be team admin');
    };
    return TeamOperationBase;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.TeamOperationBase = TeamOperationBase;
