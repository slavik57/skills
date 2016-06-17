"use strict";
var chai_1 = require('chai');
var typesValidator_1 = require('./typesValidator');
describe('TypesValidator', function () {
    describe('isNumber', function () {
        it('1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isNumber(1);
            chai_1.expect(result).to.be.true;
        });
        it('-1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isNumber(-1);
            chai_1.expect(result).to.be.true;
        });
        it('1.1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isNumber(1.1);
            chai_1.expect(result).to.be.true;
        });
        it('-1.1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isNumber(-1.1);
            chai_1.expect(result).to.be.true;
        });
        it('empty string should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber('');
            chai_1.expect(result).to.be.false;
        });
        it('"1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber('1');
            chai_1.expect(result).to.be.false;
        });
        it('-1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber('-1');
            chai_1.expect(result).to.be.false;
        });
        it('"1.1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber('1.1');
            chai_1.expect(result).to.be.false;
        });
        it('"-1.1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber('-1.1');
            chai_1.expect(result).to.be.false;
        });
        it('null should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber(null);
            chai_1.expect(result).to.be.false;
        });
        it('"undefined should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber(undefined);
            chai_1.expect(result).to.be.false;
        });
        it('{} should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber({});
            chai_1.expect(result).to.be.false;
        });
        it('[] should return false', function () {
            var result = typesValidator_1.TypesValidator.isNumber([]);
            chai_1.expect(result).to.be.false;
        });
    });
    describe('isInteger', function () {
        it('1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isInteger(1);
            chai_1.expect(result).to.be.true;
        });
        it('-1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isInteger(-1);
            chai_1.expect(result).to.be.true;
        });
        it('1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger(1.1);
            chai_1.expect(result).to.be.false;
        });
        it('-1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger(-1.1);
            chai_1.expect(result).to.be.false;
        });
        it('empty string should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger('');
            chai_1.expect(result).to.be.false;
        });
        it('"1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger('1');
            chai_1.expect(result).to.be.false;
        });
        it('-1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger('-1');
            chai_1.expect(result).to.be.false;
        });
        it('"1.1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger('1.1');
            chai_1.expect(result).to.be.false;
        });
        it('"-1.1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger('-1.1');
            chai_1.expect(result).to.be.false;
        });
        it('null should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger(null);
            chai_1.expect(result).to.be.false;
        });
        it('"undefined should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger(undefined);
            chai_1.expect(result).to.be.false;
        });
        it('{} should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger({});
            chai_1.expect(result).to.be.false;
        });
        it('[] should return false', function () {
            var result = typesValidator_1.TypesValidator.isInteger([]);
            chai_1.expect(result).to.be.false;
        });
    });
    describe('isNullOrUndefined', function () {
        it('1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined(1);
            chai_1.expect(result).to.be.false;
        });
        it('-1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined(-1);
            chai_1.expect(result).to.be.false;
        });
        it('1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined(1.1);
            chai_1.expect(result).to.be.false;
        });
        it('-1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined(-1.1);
            chai_1.expect(result).to.be.false;
        });
        it('empty string should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined('');
            chai_1.expect(result).to.be.false;
        });
        it('"1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined('1');
            chai_1.expect(result).to.be.false;
        });
        it('-1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined('-1');
            chai_1.expect(result).to.be.false;
        });
        it('"1.1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined('1.1');
            chai_1.expect(result).to.be.false;
        });
        it('"-1.1" should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined('-1.1');
            chai_1.expect(result).to.be.false;
        });
        it('null should return true', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined(null);
            chai_1.expect(result).to.be.true;
        });
        it('"undefined should return true', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined(undefined);
            chai_1.expect(result).to.be.true;
        });
        it('{} should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined({});
            chai_1.expect(result).to.be.false;
        });
        it('[] should return false', function () {
            var result = typesValidator_1.TypesValidator.isNullOrUndefined([]);
            chai_1.expect(result).to.be.false;
        });
    });
    describe('isString', function () {
        it('1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isString(1);
            chai_1.expect(result).to.be.false;
        });
        it('-1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isString(-1);
            chai_1.expect(result).to.be.false;
        });
        it('1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isString(1.1);
            chai_1.expect(result).to.be.false;
        });
        it('-1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isString(-1.1);
            chai_1.expect(result).to.be.false;
        });
        it('empty string should return true', function () {
            var result = typesValidator_1.TypesValidator.isString('');
            chai_1.expect(result).to.be.true;
        });
        it('"1" should return true', function () {
            var result = typesValidator_1.TypesValidator.isString('1');
            chai_1.expect(result).to.be.true;
        });
        it('-1" should return true', function () {
            var result = typesValidator_1.TypesValidator.isString('-1');
            chai_1.expect(result).to.be.true;
        });
        it('"1.1" should return true', function () {
            var result = typesValidator_1.TypesValidator.isString('1.1');
            chai_1.expect(result).to.be.true;
        });
        it('"-1.1" should return true', function () {
            var result = typesValidator_1.TypesValidator.isString('-1.1');
            chai_1.expect(result).to.be.true;
        });
        it('null should return false', function () {
            var result = typesValidator_1.TypesValidator.isString(null);
            chai_1.expect(result).to.be.false;
        });
        it('"undefined should return false', function () {
            var result = typesValidator_1.TypesValidator.isString(undefined);
            chai_1.expect(result).to.be.false;
        });
        it('{} should return false', function () {
            var result = typesValidator_1.TypesValidator.isString({});
            chai_1.expect(result).to.be.false;
        });
        it('[] should return false', function () {
            var result = typesValidator_1.TypesValidator.isString([]);
            chai_1.expect(result).to.be.false;
        });
    });
    describe('isString', function () {
        it('1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString(1, 0);
            chai_1.expect(result).to.be.false;
        });
        it('-1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString(-1, 0);
            chai_1.expect(result).to.be.false;
        });
        it('1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString(1.1, 0);
            chai_1.expect(result).to.be.false;
        });
        it('-1.1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString(-1.1, 0);
            chai_1.expect(result).to.be.false;
        });
        it('empty string with 0 should return true', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('', 0);
            chai_1.expect(result).to.be.true;
        });
        it('empty string with 1 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('', 1);
            chai_1.expect(result).to.be.false;
        });
        it('"1" with 1 should return true', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('1', 1);
            chai_1.expect(result).to.be.true;
        });
        it('"1" with 2 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('1', 2);
            chai_1.expect(result).to.be.false;
        });
        it('-1" with 2 should return true', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('-1', 2);
            chai_1.expect(result).to.be.true;
        });
        it('-1" with 3 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('-1', 3);
            chai_1.expect(result).to.be.false;
        });
        it('"1.1" with 3 should return true', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('1.1', 3);
            chai_1.expect(result).to.be.true;
        });
        it('"1.1" with 4 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('1.1', 4);
            chai_1.expect(result).to.be.false;
        });
        it('"-1.1" with 4 should return true', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('-1.1', 4);
            chai_1.expect(result).to.be.true;
        });
        it('"-1.1" with 5 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString('-1.1', 5);
            chai_1.expect(result).to.be.false;
        });
        it('null with 0 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString(null, 0);
            chai_1.expect(result).to.be.false;
        });
        it('"undefined with 0 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString(undefined, 0);
            chai_1.expect(result).to.be.false;
        });
        it('{} with 0 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString({}, 0);
            chai_1.expect(result).to.be.false;
        });
        it('[] with 0 should return false', function () {
            var result = typesValidator_1.TypesValidator.isLongEnoughString([], 0);
            chai_1.expect(result).to.be.false;
        });
    });
});
//# sourceMappingURL=typesValidator.test.js.map