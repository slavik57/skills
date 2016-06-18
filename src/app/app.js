"use strict";
require('./commonStyles/commonLayout.scss');
var A = (function () {
    function A() {
        console.log('env1:' + process.env.ENV);
    }
    return A;
}());
exports.A = A;
new A();
//# sourceMappingURL=app.js.map