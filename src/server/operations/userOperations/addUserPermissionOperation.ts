import {UserGlobalPermissions} from "../../models/usersGlobalPermissions";
import {ModifyUserPermissionsOperationBase} from "../base/modifyUserPermissionsOperationBase";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

export class AddUserPermissionOperation extends ModifyUserPermissionsOperationBase<UserGlobalPermissions[]> {

  constructor(private _userIdToAddPermissionsTo: number,
    private _permissionsToAdd: GlobalPermission[],
    executingUserId: number) {

    super(_userIdToAddPermissionsTo, _permissionsToAdd, executingUserId);
  }

  protected doWork(): bluebirdPromise<UserGlobalPermissions[]> {
    return UserDataHandler.addGlobalPermissions(this._userIdToAddPermissionsTo, this._permissionsToAdd);
  }

}
