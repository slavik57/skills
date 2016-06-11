import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {ModifyUserPermissionsOperationBase} from "../base/modifyUserPermissionsOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";

export class RemoveUserPermissionOperation extends ModifyUserPermissionsOperationBase {

  constructor(private _userIdToRemovePermissionsFrom: number,
    private _permissionsToRemove: GlobalPermission[],
    executingUserId: number) {

    super(_userIdToRemovePermissionsFrom, _permissionsToRemove, executingUserId);
  }

  protected doWork(): void | Promise<any> {
    return UserDataHandler.removeGlobalPermissions(this._userIdToRemovePermissionsFrom, this._permissionsToRemove);
  }

}
