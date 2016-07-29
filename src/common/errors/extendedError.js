"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ExtendedError = (function (_super) {
    __extends(ExtendedError, _super);
    function ExtendedError() {
        _super.apply(this, arguments);
    }
    return ExtendedError;
}(Error));
exports.ExtendedError = ExtendedError;
//# sourceMappingURL=extendedError.js.map