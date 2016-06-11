"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillsOperation = (function (_super) {
    __extends(GetSkillsOperation, _super);
    function GetSkillsOperation() {
        _super.call(this);
    }
    GetSkillsOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkills();
    };
    return GetSkillsOperation;
}(operationBase_1.OperationBase));
exports.GetSkillsOperation = GetSkillsOperation;
