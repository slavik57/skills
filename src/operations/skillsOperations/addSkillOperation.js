"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var skillOperationBase_1 = require("../base/skillOperationBase");
var AddSkillOperation = (function (_super) {
    __extends(AddSkillOperation, _super);
    function AddSkillOperation(executingUserId, _skillInfo) {
        _super.call(this, executingUserId);
        this._skillInfo = _skillInfo;
    }
    AddSkillOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.createSkill(this._skillInfo);
    };
    return AddSkillOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.AddSkillOperation = AddSkillOperation;
//# sourceMappingURL=addSkillOperation.js.map