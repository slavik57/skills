"use strict";
var extendedError_1 = require("../../../common/errors/extendedError");
var bluebirdPromise = require('bluebird');
var OperationBase = (function () {
    function OperationBase() {
    }
    OperationBase.prototype.canExecute = function () {
        return bluebirdPromise.resolve();
    };
    OperationBase.prototype.execute = function () {
        var _this = this;
        return this.canExecute().then(function () { return _this._doWorkSafe(); }, function (_error) { return _this._failExecution(_error); });
    };
    OperationBase.prototype.doWork = function () {
        throw 'Override the doWork method with the operation execution';
    };
    OperationBase.prototype._doWorkSafe = function () {
        try {
            return this.doWork();
        }
        catch (error) {
            var rejectionError = new extendedError_1.ExtendedError();
            rejectionError.innerError = error;
            return bluebirdPromise.reject(rejectionError);
        }
    };
    OperationBase.prototype._failExecution = function (error) {
        var rejectionError = new extendedError_1.ExtendedError();
        rejectionError.message = 'The operation cannot be executed';
        rejectionError.innerError = error;
        return bluebirdPromise.reject(rejectionError);
    };
    return OperationBase;
}());
exports.OperationBase = OperationBase;
//# sourceMappingURL=operationBase.js.map