import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {OperationBase} from './operationBase';

chai.use(chaiAsPromised);

class TestOperationBase extends OperationBase {
  public canExecuteToReturn: boolean;
  public wasExecuted = false;
  public executeOperationResult;
  public executeOperationErrorToThrow;

  constructor() {
    super();
  }

  public canExecute(): Promise<any> {
    if (this.canExecuteToReturn) {
      return Promise.resolve();
    }

    return Promise.reject(null);
  }

  protected doWork(): void | Promise<any> {
    this.wasExecuted = true;

    if (this.executeOperationErrorToThrow) {
      throw this.executeOperationErrorToThrow;
    }

    return this.executeOperationResult;
  }
}

describe('OperationBase', () => {

  var operation: TestOperationBase;

  beforeEach(() => {
    operation = new TestOperationBase();
  });

  describe('execute', () => {

    describe('can execute returns false', () => {

      beforeEach(() => {
        operation.canExecuteToReturn = false;
      })

      it('should fail and not execute', () => {
        // Act
        var promise: Promise<any> = operation.execute();

        // Assert
        return expect(promise).to.eventually.rejected
          .then(() => {
            expect(operation.wasExecuted).to.be.false;
          });
      });

    });

    describe('can execute returns true', () => {

      beforeEach(() => {
        operation.canExecuteToReturn = true;
      });

      it('should succeed and execute', () => {
        // Act
        var promise: Promise<any> = operation.execute();

        // Assert
        return expect(promise).to.eventually.fulfilled
          .then(() => {
            expect(operation.wasExecuted).to.be.true;
          });
      });

      it('operation returning result should succeed execute and return correct result', () => {
        // Arrange
        var expectedResult = {};
        operation.executeOperationResult = expectedResult;

        // Act
        var promise: Promise<any> = operation.execute();

        // Assert
        return expect(promise).to.eventually.fulfilled
          .then((_actualResult) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualResult).to.be.equal(expectedResult);
          });
      });

      it('operation throwing error should fail, execute and return correct error', () => {
        // Arrange
        var expectedError = {};
        operation.executeOperationErrorToThrow = expectedError;

        // Act
        var promise: Promise<any> = operation.execute();

        // Assert
        return expect(promise).to.eventually.rejected
          .then((_actualError) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualError).to.be.equal(expectedError);
          });
      });

      it('operation returning resolved promise should succeed execute and return correct result', () => {
        // Arrange
        var expectedResult = {};
        operation.executeOperationResult = Promise.resolve(expectedResult);

        // Act
        var promise: Promise<any> = operation.execute();

        // Assert
        return expect(promise).to.eventually.fulfilled
          .then((_actualResult) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualResult).to.be.equal(expectedResult);
          });
      });

      it('operation returning rejected promise should fail, execute and return correct error', () => {
        // Arrange
        var expectedResult = {};
        operation.executeOperationResult = Promise.reject(expectedResult);

        // Act
        var promise: Promise<any> = operation.execute();

        // Assert
        return expect(promise).to.eventually.rejected
          .then((_actualError) => {
            expect(operation.wasExecuted).to.be.true;
            expect(_actualError).to.be.equal(expectedResult);
          });
      });

    });

  });

});
