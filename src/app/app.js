"use strict";
require('./views/signin.css');
var A = (function () {
    function A() {
        console.log('env1:' + process.env.ENV);
    }
    return A;
}());
exports.A = A;
new A();
//# sourceMappingURL=app.js.map