import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetUserPermissionsOperation extends OperationBase<GlobalPermission[]> {

  constructor(private _userId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<GlobalPermission[]> {
    return UserDataHandler.getUserGlobalPermissions(this._userId);
  }

}
