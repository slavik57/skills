"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var skillOperationBase_1 = require("../base/skillOperationBase");
var RemoveSkillPrerequisiteOperation = (function (_super) {
    __extends(RemoveSkillPrerequisiteOperation, _super);
    function RemoveSkillPrerequisiteOperation(_skillId, _skillPrerequisiteId, executingUserId) {
        _super.call(this, executingUserId);
        this._skillId = _skillId;
        this._skillPrerequisiteId = _skillPrerequisiteId;
    }
    RemoveSkillPrerequisiteOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.removeSkillPrerequisite(this._skillId, this._skillPrerequisiteId);
    };
    return RemoveSkillPrerequisiteOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.RemoveSkillPrerequisiteOperation = RemoveSkillPrerequisiteOperation;
