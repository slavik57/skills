"use strict";
var modelInfoVerificator_1 = require("./modelInfoVerificator");
var _ = require('lodash');
var chai_1 = require('chai');
var ModelVerificator = (function () {
    function ModelVerificator() {
    }
    ModelVerificator.verifyMultipleModelInfosOrderedAsync = function (actualModelsPromise, expectedInfos, infoComparer) {
        return chai_1.expect(actualModelsPromise).to.eventually.fulfilled
            .then(function (models) {
            var actualInfos = _.map(models, function (_) { return _.attributes; });
            modelInfoVerificator_1.ModelInfoVerificator.verifyMultipleInfosOrdered(actualInfos, expectedInfos, infoComparer);
        });
    };
    ModelVerificator.verifyModelInfoAsync = function (actualModelPromise, expectedInfo) {
        return chai_1.expect(actualModelPromise).to.eventually.fulfilled
            .then(function (model) {
            modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(model.attributes, expectedInfo);
        });
    };
    ModelVerificator.verifyMultipleModelsEqualById = function (actual, expected) {
        chai_1.expect(actual.length).to.be.equal(expected.length);
        var sortedActual = _.orderBy(actual, function (_) { return _.id; });
        var sortedExpected = _.orderBy(expected, function (_) { return _.id; });
        chai_1.expect(sortedActual).to.deep.equal(sortedExpected);
    };
    return ModelVerificator;
}());
exports.ModelVerificator = ModelVerificator;
