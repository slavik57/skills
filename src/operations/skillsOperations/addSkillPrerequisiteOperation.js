"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var skillOperationBase_1 = require("../base/skillOperationBase");
var AddSkillPrerequisiteOperation = (function (_super) {
    __extends(AddSkillPrerequisiteOperation, _super);
    function AddSkillPrerequisiteOperation(_skillId, _skillPrerequisiteId, executingUserId) {
        _super.call(this, executingUserId);
        this._skillId = _skillId;
        this._skillPrerequisiteId = _skillPrerequisiteId;
    }
    AddSkillPrerequisiteOperation.prototype.doWork = function () {
        var skillPrerequisiteInfo = {
            skill_id: this._skillId,
            skill_prerequisite_id: this._skillPrerequisiteId
        };
        return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
    };
    return AddSkillPrerequisiteOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.AddSkillPrerequisiteOperation = AddSkillPrerequisiteOperation;
//# sourceMappingURL=addSkillPrerequisiteOperation.js.map