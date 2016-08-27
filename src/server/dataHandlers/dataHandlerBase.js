"use strict";
var stringManipulator_1 = require("../../common/stringManipulator");
var DataHandlerBase = (function () {
    function DataHandlerBase() {
    }
    DataHandlerBase._createLikeQueryValue = function (value) {
        var fixedValue = this._fixValueForLikeQuery(value);
        return '%' + fixedValue + '%';
    };
    DataHandlerBase._fixValueForLikeQuery = function (value) {
        var noLodash = stringManipulator_1.StringManipulator.replaceAll(value, '_', '\\_');
        var noPercentage = stringManipulator_1.StringManipulator.replaceAll(noLodash, '%', '\\%');
        return noPercentage;
    };
    return DataHandlerBase;
}());
exports.DataHandlerBase = DataHandlerBase;
//# sourceMappingURL=dataHandlerBase.js.map