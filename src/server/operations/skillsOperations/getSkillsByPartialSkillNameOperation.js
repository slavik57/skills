"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillsByPartialSkillNameOperation = (function (_super) {
    __extends(GetSkillsByPartialSkillNameOperation, _super);
    function GetSkillsByPartialSkillNameOperation(partialSkillName, maxNumberOfSkills) {
        if (maxNumberOfSkills === void 0) { maxNumberOfSkills = null; }
        _super.call(this);
        this.partialSkillName = partialSkillName;
        this.maxNumberOfSkills = maxNumberOfSkills;
    }
    GetSkillsByPartialSkillNameOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkillsByPartialSkillName(this.partialSkillName, this.maxNumberOfSkills);
    };
    return GetSkillsByPartialSkillNameOperation;
}(operationBase_1.OperationBase));
exports.GetSkillsByPartialSkillNameOperation = GetSkillsByPartialSkillNameOperation;
//# sourceMappingURL=getSkillsByPartialSkillNameOperation.js.map