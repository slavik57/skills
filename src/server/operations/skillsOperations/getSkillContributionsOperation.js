"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillContributionsOperation = (function (_super) {
    __extends(GetSkillContributionsOperation, _super);
    function GetSkillContributionsOperation(_skillId) {
        _super.call(this);
        this._skillId = _skillId;
    }
    GetSkillContributionsOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(this._skillId);
    };
    return GetSkillContributionsOperation;
}(operationBase_1.OperationBase));
exports.GetSkillContributionsOperation = GetSkillContributionsOperation;
//# sourceMappingURL=getSkillContributionsOperation.js.map