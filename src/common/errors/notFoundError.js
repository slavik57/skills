"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NotFoundError = (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError() {
        _super.apply(this, arguments);
    }
    return NotFoundError;
}(Error));
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=notFoundError.js.map