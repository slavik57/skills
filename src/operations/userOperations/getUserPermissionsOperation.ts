import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetUserPermissionsOperation extends OperationBase {

  constructor(private _userId: number) {
    super();
  }

  protected doWork(): void | Promise<any> {
    return UserDataHandler.getUserGlobalPermissions(this._userId);
  }

}