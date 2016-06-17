"use strict";
var path = require('path');
var _root = path.resolve(__dirname, '..');
var PathHelper = (function () {
    function PathHelper() {
    }
    PathHelper.getFullPathCombined = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        args = Array.prototype.slice.call(arguments, 0);
        return path.join.apply(path, [_root].concat(args));
    };
    return PathHelper;
}());
exports.PathHelper = PathHelper;
//# sourceMappingURL=pathHelper.js.map