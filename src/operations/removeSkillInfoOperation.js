"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../dataHandlers/skillsDataHandler");
var skillOperationBase_1 = require("./base/skillOperationBase");
var RemoveSkillOperation = (function (_super) {
    __extends(RemoveSkillOperation, _super);
    function RemoveSkillOperation(executingUserId, _skillId) {
        _super.call(this, executingUserId);
        this._skillId = _skillId;
    }
    RemoveSkillOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.deleteSkill(this._skillId);
    };
    return RemoveSkillOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.RemoveSkillOperation = RemoveSkillOperation;
