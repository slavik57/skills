import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {OperationBase} from "../base/operationBase";
import * as _ from 'lodash';

interface IAllowedPermissionModificationMap {
  [key: number]: GlobalPermission[];
}

export class GetAllowedUserPermissionsToModifyOperation extends OperationBase {

  private static _allowedPermissionModificationMap: IAllowedPermissionModificationMap;

  constructor(private _userId: number) {
    super();
  }

  protected doWork(): void | Promise<any> {
    var userGlobalPermissionsPromise: Promise<GlobalPermission[]> =
      UserDataHandler.getUserGlobalPermissions(this._userId);

    return userGlobalPermissionsPromise.then((_permissions: GlobalPermission[]) => {
      return this._getListOfGlobalPermissionsTheExecutingUserCanModify(_permissions);
    });
  }

  private static _getAllowedPermissionModificationMap(): IAllowedPermissionModificationMap {
    if (this._allowedPermissionModificationMap) {
      return this._allowedPermissionModificationMap;
    }

    this._allowedPermissionModificationMap = {};

    this._allowedPermissionModificationMap[GlobalPermission.ADMIN] = [
      GlobalPermission.ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN,
      GlobalPermission.SKILLS_LIST_ADMIN
    ];

    this._allowedPermissionModificationMap[GlobalPermission.TEAMS_LIST_ADMIN] = [
      GlobalPermission.TEAMS_LIST_ADMIN
    ];

    this._allowedPermissionModificationMap[GlobalPermission.SKILLS_LIST_ADMIN] = [
      GlobalPermission.SKILLS_LIST_ADMIN
    ];

    return this._allowedPermissionModificationMap;
  }

  private _getListOfGlobalPermissionsTheExecutingUserCanModify(executingUserPermissions: GlobalPermission[]): GlobalPermission[] {
    var result: GlobalPermission[] = [];

    var allowedPermissionModificationMap: IAllowedPermissionModificationMap =
      GetAllowedUserPermissionsToModifyOperation._getAllowedPermissionModificationMap();

    executingUserPermissions.forEach((_permission: GlobalPermission) => {
      if (_permission in allowedPermissionModificationMap) {
        var allowedPermissionsToModify: GlobalPermission[] = allowedPermissionModificationMap[_permission];

        result = _.union(result, allowedPermissionsToModify);
      }
    });

    return result;
  }

}
