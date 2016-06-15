import {IOperationExecutionError} from "../interfaces/iOperationExecutionError";

export class OperationBase<T> {

  constructor() {
  }

  public canExecute(): Promise<any> {
    return Promise.resolve();
  }

  public execute(): Promise<T> {
    return this.canExecute().then(
      () => this._doWorkSafe(),
      (_error) => this._failExecution(_error)
    );
  }

  protected doWork(): Promise<T> {
    throw 'Override the doWork method with the operation execution';
  }

  private _doWorkSafe(): Promise<T> {
    try {
      return this.doWork();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private _failExecution(error: any): Promise<IOperationExecutionError> {
    return Promise.reject({
      message: 'The operation cannot be executed',
      innerError: error
    });
  }

}
