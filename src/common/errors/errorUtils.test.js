"use strict";
var unauthorizedError_1 = require("./unauthorizedError");
var extendedError_1 = require("./extendedError");
var errorUtils_1 = require("./errorUtils");
var chai_1 = require('chai');
describe('ErrorUrils', function () {
    describe('isErrorOfType', function () {
        it('not error should return false', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType('', unauthorizedError_1.UnauthorizedError)).to.be.false;
        });
        it('simple error should return false', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(new Error(), unauthorizedError_1.UnauthorizedError)).to.be.false;
        });
        it('Extended error should return false', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(new extendedError_1.ExtendedError(), unauthorizedError_1.UnauthorizedError)).to.be.false;
        });
        it('UnauthorizedError error should return true', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(new unauthorizedError_1.UnauthorizedError(), unauthorizedError_1.UnauthorizedError)).to.be.true;
        });
        it('Extended error with inner UnauthorizedError should return true', function () {
            var error = new extendedError_1.ExtendedError();
            error.innerError = new unauthorizedError_1.UnauthorizedError();
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)).to.be.true;
        });
        it('Extended error with inner simple error should return false', function () {
            var error = new extendedError_1.ExtendedError();
            error.innerError = new Error();
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)).to.be.false;
        });
        it('Extended error with inner inner UnauthorizedError should return true', function () {
            var error = new extendedError_1.ExtendedError();
            error.innerError = new extendedError_1.ExtendedError();
            error.innerError.innerError = new unauthorizedError_1.UnauthorizedError();
            chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)).to.be.true;
        });
    });
});
//# sourceMappingURL=errorUtils.test.js.map