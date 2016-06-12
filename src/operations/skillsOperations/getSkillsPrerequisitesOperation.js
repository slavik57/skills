"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillsPrerequisitesOperation = (function (_super) {
    __extends(GetSkillsPrerequisitesOperation, _super);
    function GetSkillsPrerequisitesOperation() {
        _super.call(this);
    }
    GetSkillsPrerequisitesOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkillsToPrerequisitesMap();
    };
    return GetSkillsPrerequisitesOperation;
}(operationBase_1.OperationBase));
exports.GetSkillsPrerequisitesOperation = GetSkillsPrerequisitesOperation;
