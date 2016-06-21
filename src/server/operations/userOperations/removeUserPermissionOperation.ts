import {UserGlobalPermissions} from "../../models/usersGlobalPermissions";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {ModifyUserPermissionsOperationBase} from "../base/modifyUserPermissionsOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as bluebirdPromise from 'bluebird';

export class RemoveUserPermissionOperation extends ModifyUserPermissionsOperationBase<UserGlobalPermissions[]> {

  constructor(private _userIdToRemovePermissionsFrom: number,
    private _permissionsToRemove: GlobalPermission[],
    executingUserId: number) {

    super(_userIdToRemovePermissionsFrom, _permissionsToRemove, executingUserId);
  }

  protected doWork(): bluebirdPromise<UserGlobalPermissions[]> {
    return UserDataHandler.removeGlobalPermissions(this._userIdToRemovePermissionsFrom, this._permissionsToRemove);
  }

}
