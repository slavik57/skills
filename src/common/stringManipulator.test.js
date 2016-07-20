"use strict";
var stringManipulator_1 = require("./stringManipulator");
var chai_1 = require('chai');
describe('StringManipulator', function () {
    it('should replace correctly', function () {
        var original = 'abc1def1ghij1klmnop';
        var expected = 'abc2def2ghij2klmnop';
        chai_1.expect(stringManipulator_1.StringManipulator.replaceAll(original, '1', '2')).to.be.equal(expected);
    });
});
//# sourceMappingURL=stringManipulator.test.js.map