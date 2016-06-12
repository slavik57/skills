import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetUserPermissionsOperation extends OperationBase<GlobalPermission[]> {

  constructor(private _userId: number) {
    super();
  }

  protected doWork(): Promise<GlobalPermission[]> {
    return UserDataHandler.getUserGlobalPermissions(this._userId);
  }

}
