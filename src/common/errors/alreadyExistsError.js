"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AlreadyExistsError = (function (_super) {
    __extends(AlreadyExistsError, _super);
    function AlreadyExistsError() {
        _super.apply(this, arguments);
    }
    return AlreadyExistsError;
}(Error));
exports.AlreadyExistsError = AlreadyExistsError;
//# sourceMappingURL=alreadyExistsError.js.map