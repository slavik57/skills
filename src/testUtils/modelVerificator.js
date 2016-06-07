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
    return ModelVerificator;
}());
exports.ModelVerificator = ModelVerificator;
