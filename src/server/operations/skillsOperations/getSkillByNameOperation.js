"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var operationBase_1 = require("../base/operationBase");
var GetSkillByNameOperation = (function (_super) {
    __extends(GetSkillByNameOperation, _super);
    function GetSkillByNameOperation(name) {
        _super.call(this);
        this.name = name;
    }
    GetSkillByNameOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.getSkillByName(this.name);
    };
    return GetSkillByNameOperation;
}(operationBase_1.OperationBase));
exports.GetSkillByNameOperation = GetSkillByNameOperation;
//# sourceMappingURL=getSkillByNameOperation.js.map