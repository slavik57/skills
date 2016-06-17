"use strict";
var OperationBase = (function () {
    function OperationBase() {
    }
    OperationBase.prototype.canExecute = function () {
        return Promise.resolve();
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
            return Promise.reject(error);
        }
    };
    OperationBase.prototype._failExecution = function (error) {
        return Promise.reject({
            message: 'The operation cannot be executed',
            innerError: error
        });
    };
    return OperationBase;
}());
exports.OperationBase = OperationBase;
//# sourceMappingURL=operationBase.js.map