"use strict";
var unauthorizedError_1 = require("./unauthorizedError");
var extendedError_1 = require("./extendedError");
var errorUtils_1 = require("./errorUtils");
var chai_1 = require('chai');
describe('ErrorUrils', function () {
    describe('IsUnautorizedError', function () {
        it('not error should return false', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError('')).to.be.false;
        });
        it('simple error should return false', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError(new Error())).to.be.false;
        });
        it('Extended error should return false', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError(new extendedError_1.ExtendedError())).to.be.false;
        });
        it('UnauthorizedError error should return true', function () {
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError(new unauthorizedError_1.UnauthorizedError())).to.be.true;
        });
        it('Extended error with inner UnauthorizedError should return true', function () {
            var error = new extendedError_1.ExtendedError();
            error.innerError = new unauthorizedError_1.UnauthorizedError();
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError(error)).to.be.true;
        });
        it('Extended error with inner simple error should return false', function () {
            var error = new extendedError_1.ExtendedError();
            error.innerError = new Error();
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError(error)).to.be.false;
        });
        it('Extended error with inner inner UnauthorizedError should return true', function () {
            var error = new extendedError_1.ExtendedError();
            error.innerError = new extendedError_1.ExtendedError();
            error.innerError.innerError = new unauthorizedError_1.UnauthorizedError();
            chai_1.expect(errorUtils_1.ErrorUtils.IsUnautorizedError(error)).to.be.true;
        });
    });
});
//# sourceMappingURL=errorUtils.test.js.map