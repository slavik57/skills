"use strict";
var TypesValidator = (function () {
    function TypesValidator() {
    }
    TypesValidator.isNumber = function (value) {
        return typeof value === 'number' &&
            !isNaN(value) &&
            isFinite(value);
    };
    TypesValidator.isInteger = function (value) {
        if (!TypesValidator.isNumber(value)) {
            return false;
        }
        return /^-?\d+$/.test(value);
    };
    TypesValidator.isNullOrUndefined = function (value) {
        return value === null ||
            value === undefined;
    };
    TypesValidator.isString = function (value) {
        return typeof value == 'string';
    };
    TypesValidator.isLongEnoughString = function (value, minLength) {
        return TypesValidator.isString(value) &&
            value.length >= minLength;
    };
    return TypesValidator;
}());
exports.TypesValidator = TypesValidator;
//# sourceMappingURL=typesValidator.js.map