"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var notFoundError_1 = require("../../../common/errors/notFoundError");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var addRemoveUserFromTeamOperationBase_1 = require("../base/addRemoveUserFromTeamOperationBase");
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var bluebirdPromise = require('bluebird');
var AddUserToTeamOperation = (function (_super) {
    __extends(AddUserToTeamOperation, _super);
    function AddUserToTeamOperation(_usernameToAdd, _teamId, _shouldBeAdmin, _executingUserId) {
        _super.call(this, _teamId, _executingUserId);
        this._usernameToAdd = _usernameToAdd;
        this._shouldBeAdmin = _shouldBeAdmin;
    }
    AddUserToTeamOperation.prototype.doWork = function () {
        var _this = this;
        return userDataHandler_1.UserDataHandler.getUserByUsername(this._usernameToAdd)
            .then(function (_user) {
            if (!_user) {
                var error = new notFoundError_1.NotFoundError();
                error.message = 'User with username: [' + _this._usernameToAdd + '] not found';
                return bluebirdPromise.reject(error);
            }
            return _user;
        })
            .then(function (_user) {
            return {
                team_id: _this.teamId,
                user_id: _user.id,
                is_admin: _this._shouldBeAdmin
            };
        })
            .then(function (_teamMemberInfo) { return teamsDataHandler_1.TeamsDataHandler.addTeamMember(_teamMemberInfo); });
    };
    return AddUserToTeamOperation;
}(addRemoveUserFromTeamOperationBase_1.AddRemoveUserFromTeamOperationBase));
exports.AddUserToTeamOperation = AddUserToTeamOperation;
//# sourceMappingURL=addUserToTeamOperation.js.map