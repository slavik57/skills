import {ExtendedError} from "../../../common/ExtendedError";
import {IOperationExecutionError} from "../interfaces/iOperationExecutionError";
import * as bluebirdPromise from 'bluebird';

export class OperationBase<T> {

  constructor() {
  }

  public canExecute(): bluebirdPromise<any> {
    return bluebirdPromise.resolve();
  }

  public execute(): bluebirdPromise<T> {
    return this.canExecute().then(
      () => this._doWorkSafe(),
      (_error) => this._failExecution(_error)
    );
  }

  protected doWork(): bluebirdPromise<T> {
    throw 'Override the doWork method with the operation execution';
  }

  private _doWorkSafe(): bluebirdPromise<T> {
    try {
      return this.doWork();
    } catch (error) {
      var rejectionError = new ExtendedError();
      rejectionError.innerError = error;
      return bluebirdPromise.reject(rejectionError);
    }
  }

  private _failExecution(error: any): bluebirdPromise<T> {
    var rejectionError = new ExtendedError();
    rejectionError.message = 'The operation cannot be executed';
    rejectionError.innerError = error;

    return bluebirdPromise.reject(rejectionError);
  }

}
