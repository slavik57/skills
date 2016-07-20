"use strict";
var StringManipulator = (function () {
    function StringManipulator() {
    }
    StringManipulator.replaceAll = function (str, search, replaceWith) {
        return str.replace(new RegExp(search, 'g'), replaceWith);
    };
    return StringManipulator;
}());
exports.StringManipulator = StringManipulator;
//# sourceMappingURL=stringManipulator.js.map