"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var b_1 = require('./b');
var A = (function (_super) {
    __extends(A, _super);
    function A() {
        _super.call(this);
        console.log(11223);
        alert('env1:' + process.env.ENV);
    }
    return A;
}(b_1.B));
exports.A = A;
new A();
//# sourceMappingURL=app.js.map