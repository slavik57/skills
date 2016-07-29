import {UserGlobalPermissions} from "../../models/usersGlobalPermissions";
import {ModifyUserPermissionsOperationBase} from "../base/modifyUserPermissionsOperationBase";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

export class UpdateUserPermissionsOperation extends ModifyUserPermissionsOperationBase<void> {

  constructor(userIdToModifyPermissionsOf: number,
    private _permissionsToAdd: GlobalPermission[],
    private _permissionsToRemove: GlobalPermission[],
    executingUserId: number) {
    super(userIdToModifyPermissionsOf, _.union(_permissionsToAdd, _permissionsToRemove), executingUserId);
  }

  protected doWork(): bluebirdPromise<void> {
    return UserDataHandler.updateGlobalPermissions(this.userIdToModifyPermissionsOf,
      this._permissionsToAdd,
      this._permissionsToRemove);
  }

}
