"use strict";
var userRequestIdValidator_1 = require("./userRequestIdValidator");
var chai_1 = require('chai');
describe('UserRequestIdValidator', function () {
    var request;
    beforeEach(function () {
        request = {
            user: {
                id: 123
            }
        };
    });
    describe('isRequestFromUser', function () {
        it('null request should return false', function () {
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(null, '1')).to.be.false;
        });
        it('undefined request should return false', function () {
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(undefined, '1')).to.be.false;
        });
        it('request without user should return false', function () {
            request.user = null;
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, '1')).to.be.false;
        });
        it('request without user id should return false', function () {
            request.user.id = null;
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, '1')).to.be.false;
        });
        it('null user id request should return false', function () {
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, null)).to.be.false;
        });
        it('undefined user id request should return false', function () {
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, undefined)).to.be.false;
        });
        it('empty user id request should return false', function () {
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, '')).to.be.false;
        });
        it('different user id request should return false', function () {
            var otherId = request.user.id + 1;
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, otherId.toString())).to.be.false;
        });
        it('same user id request should return true', function () {
            var id = request.user.id;
            chai_1.expect(userRequestIdValidator_1.UserRequestIdValidator.isRequestFromUser(request, id.toString())).to.be.true;
        });
    });
});
//# sourceMappingURL=userRequestIdValidator.test.js.map