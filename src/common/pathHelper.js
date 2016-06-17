"use strict";
var path = require('path');
var PathHelper = (function () {
    function PathHelper() {
    }
    PathHelper.getPathFromRoot = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        args = Array.prototype.slice.call(arguments, 0);
        return path.join.apply(path, [this.root].concat(args));
    };
    PathHelper.root = path.resolve(__dirname, '..', '..');
    return PathHelper;
}());
exports.PathHelper = PathHelper;
//# sourceMappingURL=pathHelper.js.map