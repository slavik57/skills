"use strict";
var _ = require('lodash');
var chai_1 = require('chai');
var ModelInfoVerificator = (function () {
    function ModelInfoVerificator() {
    }
    ModelInfoVerificator.verifyMultipleInfosOrdered = function (actual, expected, infoComparer) {
        var actualOrdered = actual.sort(infoComparer);
        var expectedOrdered = expected.sort(infoComparer);
        chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
        for (var i = 0; i < expected.length; i++) {
            this.verifyInfo(actualOrdered[i], expectedOrdered[i]);
        }
    };
    ModelInfoVerificator.verifyInfo = function (actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned.id;
        delete expectedCloned.id;
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    };
    return ModelInfoVerificator;
}());
exports.ModelInfoVerificator = ModelInfoVerificator;
//# sourceMappingURL=modelInfoVerificator.js.map