import {IOperationExecutionError} from "./interfaces/iOperationExecutionError";
export class OperationBase {

  constructor() {
  }

  protected canExecute(): Promise<any> {
    return Promise.resolve();
  }

  public execute(): Promise<any> {
    return this.canExecute().then(
      () => this._doWorkSafe(),
      (_error) => this._failExecution(_error)
    );
  }

  protected doWork(): void | Promise<any> {
    throw 'Override the doWork method with the operation execution';
  }

  private _doWorkSafe(): void | Promise<any> {
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
