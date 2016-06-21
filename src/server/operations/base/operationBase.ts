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
      return bluebirdPromise.reject(error);
    }
  }

  private _failExecution(error: any): bluebirdPromise<T> {
    return bluebirdPromise.reject({
      message: 'The operation cannot be executed',
      innerError: error
    });
  }

}
