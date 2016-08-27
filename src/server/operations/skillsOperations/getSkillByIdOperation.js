"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillByIdOperation = (function (_super) {
    __extends(GetSkillByIdOperation, _super);
    function GetSkillByIdOperation(skillId) {
        _super.call(this);
        this.skillId = skillId;
    }
    GetSkillByIdOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkill(this.skillId);
    };
    return GetSkillByIdOperation;
}(operationBase_1.OperationBase));
exports.GetSkillByIdOperation = GetSkillByIdOperation;
//# sourceMappingURL=getSkillByIdOperation.js.map