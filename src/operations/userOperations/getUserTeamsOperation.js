"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetUserTeamsOperation = (function (_super) {
    __extends(GetUserTeamsOperation, _super);
    function GetUserTeamsOperation(_userId) {
        _super.call(this);
        this._userId = _userId;
    }
    GetUserTeamsOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.getTeams(this._userId);
    };
    return GetUserTeamsOperation;
}(operationBase_1.OperationBase));
exports.GetUserTeamsOperation = GetUserTeamsOperation;
