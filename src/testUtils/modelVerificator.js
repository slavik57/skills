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
        var actualInfos = _.map(sortedActual, function (_) { return _.attributes; });
        var expectedInfos = _.map(sortedExpected, function (_) { return _.attributes; });
        chai_1.expect(actualInfos).to.deep.equal(expectedInfos);
    };
    return ModelVerificator;
}());
exports.ModelVerificator = ModelVerificator;
