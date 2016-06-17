"use strict";
var A = (function () {
    function A() {
        alert('env1:' + process.env.ENV);
    }
    return A;
}());
exports.A = A;
new A();
//# sourceMappingURL=app.js.map