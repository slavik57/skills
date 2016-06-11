"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillPrerequisitesOperation = (function (_super) {
    __extends(GetSkillPrerequisitesOperation, _super);
    function GetSkillPrerequisitesOperation(_skillId) {
        _super.call(this);
        this._skillId = _skillId;
    }
    GetSkillPrerequisitesOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(this._skillId);
    };
    return GetSkillPrerequisitesOperation;
}(operationBase_1.OperationBase));
exports.GetSkillPrerequisitesOperation = GetSkillPrerequisitesOperation;
