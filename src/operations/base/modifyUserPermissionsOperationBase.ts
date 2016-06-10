import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "./operationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as _ from 'lodash';

interface IAllowedPermissionModificationMap {
  [key: number]: GlobalPermission[];
}

export class ModifyUserPermissionsOperationBase extends OperationBase {

  private static _allowedPermissionModificationMap: IAllowedPermissionModificationMap;

  constructor(private _userIdToModifyPermissionsOf: number,
    private _permissionsToModify: GlobalPermission[],
    private _executingUserId: number) {

    super();
  }

  public static getListOfGlobalPermissionsTheExecutingUserCanModify(executingUserId: number): Promise<GlobalPermission[]> {
    this._getAllowedPermissionModificationMap();

    var userGlobalPermissionsPromise: Promise<GlobalPermission[]> =
      UserDataHandler.getUserGlobalPermissions(executingUserId);

    return userGlobalPermissionsPromise.then((_permissions: GlobalPermission[]) => {
      return this._getListOfGlobalPermissionsTheExecutingUserCanModify(_permissions);
    });
  }

  protected canExecute(): Promise<any> {
    var listOfPermissionsTheExecutingUserCanModifyPromise: Promise<GlobalPermission[]> =
      ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(this._executingUserId);

    return listOfPermissionsTheExecutingUserCanModifyPromise
      .then((_permissionsExecutingUserCanModify: GlobalPermission[]) => {
        return this._canExecutingUserModifyPermissions(_permissionsExecutingUserCanModify);
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

  private static _getListOfGlobalPermissionsTheExecutingUserCanModify(executingUserPermissions: GlobalPermission[]): GlobalPermission[] {
    var result: GlobalPermission[] = [];

    var allowedPermissionModificationMap: IAllowedPermissionModificationMap =
      this._getAllowedPermissionModificationMap();

    executingUserPermissions.forEach((_permission: GlobalPermission) => {
      if (_permission in allowedPermissionModificationMap) {
        var allowedPermissionsToModify: GlobalPermission[] = allowedPermissionModificationMap[_permission];

        result = _.union(result, allowedPermissionsToModify);
      }
    });

    return result;
  }

  private _canExecutingUserModifyPermissions(permissionsExecutingUserCanModify: GlobalPermission[]): Promise<any> {
    var permissionsTheExecutingUserCannotAdd: GlobalPermission[] =
      _.difference(this._permissionsToModify, permissionsExecutingUserCanModify);

    if (permissionsTheExecutingUserCannotAdd.length < 1) {
      return Promise.resolve();
    } else {
      return this._rejectWithNotAllowedPermissionsToModify(permissionsTheExecutingUserCannotAdd);
    }
  }

  private _rejectWithNotAllowedPermissionsToModify(permissionsTheExecutingUserCannotAdd: GlobalPermission[]): Promise<any> {
    var permissionNames: string[] = _.map(permissionsTheExecutingUserCannotAdd, _permission => GlobalPermission[_permission]);

    var message = 'The executing user cannot modify the permissions: ' + permissionNames.join(', ');

    return Promise.reject(message);
  }

}
