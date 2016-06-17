"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var operationBase_1 = require('./operationBase');
chai.use(chaiAsPromised);
var TestOperationBase = (function (_super) {
    __extends(TestOperationBase, _super);
    function TestOperationBase() {
        _super.call(this);
        this.wasExecuted = false;
    }
    TestOperationBase.prototype.canExecute = function () {
        if (this.canExecuteToReturn) {
            return Promise.resolve();
        }
        return Promise.reject(null);
    };
    TestOperationBase.prototype.doWork = function () {
        this.wasExecuted = true;
        if (this.executeOperationErrorToThrow) {
            throw this.executeOperationErrorToThrow;
        }
        return this.executeOperationResult;
    };
    return TestOperationBase;
}(operationBase_1.OperationBase));
describe('OperationBase', function () {
    var operation;
    beforeEach(function () {
        operation = new TestOperationBase();
    });
    describe('execute', function () {
        describe('can execute returns false', function () {
            beforeEach(function () {
                operation.canExecuteToReturn = false;
            });
            it('should fail and not execute', function () {
                var promise = operation.execute();
                return chai_1.expect(promise).to.eventually.rejected
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.false;
                });
            });
        });
        describe('can execute returns true', function () {
            beforeEach(function () {
                operation.canExecuteToReturn = true;
            });
            it('should succeed and execute', function () {
                var promise = operation.execute();
                return chai_1.expect(promise).to.eventually.fulfilled
                    .then(function () {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                });
            });
            it('operation returning result should succeed execute and return correct result', function () {
                var expectedResult = {};
                operation.executeOperationResult = expectedResult;
                var promise = operation.execute();
                return chai_1.expect(promise).to.eventually.fulfilled
                    .then(function (_actualResult) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualResult).to.be.equal(expectedResult);
                });
            });
            it('operation throwing error should fail, execute and return correct error', function () {
                var expectedError = {};
                operation.executeOperationErrorToThrow = expectedError;
                var promise = operation.execute();
                return chai_1.expect(promise).to.eventually.rejected
                    .then(function (_actualError) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualError).to.be.equal(expectedError);
                });
            });
            it('operation returning resolved promise should succeed execute and return correct result', function () {
                var expectedResult = {};
                operation.executeOperationResult = Promise.resolve(expectedResult);
                var promise = operation.execute();
                return chai_1.expect(promise).to.eventually.fulfilled
                    .then(function (_actualResult) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualResult).to.be.equal(expectedResult);
                });
            });
            it('operation returning rejected promise should fail, execute and return correct error', function () {
                var expectedResult = {};
                operation.executeOperationResult = Promise.reject(expectedResult);
                var promise = operation.execute();
                return chai_1.expect(promise).to.eventually.rejected
                    .then(function (_actualError) {
                    chai_1.expect(operation.wasExecuted).to.be.true;
                    chai_1.expect(_actualError).to.be.equal(expectedResult);
                });
            });
        });
    });
});
//# sourceMappingURL=operationBase.test.js.map