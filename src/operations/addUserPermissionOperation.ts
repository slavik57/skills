import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {OperationBase} from "./base/operationBase";
import {GlobalPermission} from "../models/enums/globalPermission";
import * as _ from 'lodash';

interface IAllowedPermissionAssignmentMap {
  [key: number]: GlobalPermission[];
}

export class AddUserPermissionOperation extends OperationBase {

  private static _allowedPermissionAssignmentMap: IAllowedPermissionAssignmentMap;

  constructor(private _userIdToAddPermissionsTo: number,
    private _permissionsToAdd: GlobalPermission[],
    private _executingUserId: number) {

    super();
  }

  public static getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUserId: number): Promise<GlobalPermission[]> {
    this._getAllowedPermissionAssignmentMap();

    var userGlobalPermissionsPromise: Promise<GlobalPermission[]> =
      UserDataHandler.getUserGlobalPermissions(executingUserId);

    return userGlobalPermissionsPromise.then((_permissions: GlobalPermission[]) => {
      return this._getListOfGlobalPermissionsTheExecutingUserCanAddToUser(_permissions);
    });
  }

  protected canExecute(): Promise<any> {
    var listOfPermissionsTheExecutingUserCanAddPromise: Promise<GlobalPermission[]> =
      AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(this._executingUserId);

    return listOfPermissionsTheExecutingUserCanAddPromise
      .then((_permissionsExecutingUserCanAdd: GlobalPermission[]) => {
        return this._canExecutingUserAddPermissions(_permissionsExecutingUserCanAdd);
      });
  }

  protected doWork(): void | Promise<any> {
    return UserDataHandler.addGlobalPermissions(this._userIdToAddPermissionsTo, this._permissionsToAdd);
  }

  private static _getAllowedPermissionAssignmentMap(): IAllowedPermissionAssignmentMap {
    if (this._allowedPermissionAssignmentMap) {
      return this._allowedPermissionAssignmentMap;
    }

    this._allowedPermissionAssignmentMap = {};

    this._allowedPermissionAssignmentMap[GlobalPermission.ADMIN] = [
      GlobalPermission.ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN,
      GlobalPermission.SKILLS_LIST_ADMIN
    ];

    this._allowedPermissionAssignmentMap[GlobalPermission.TEAMS_LIST_ADMIN] = [
      GlobalPermission.TEAMS_LIST_ADMIN
    ];

    this._allowedPermissionAssignmentMap[GlobalPermission.SKILLS_LIST_ADMIN] = [
      GlobalPermission.SKILLS_LIST_ADMIN
    ];

    return this._allowedPermissionAssignmentMap;
  }

  private static _getListOfGlobalPermissionsTheExecutingUserCanAddToUser(executingUserPermissions: GlobalPermission[]): GlobalPermission[] {
    var result: GlobalPermission[] = [];

    var allowedPermissionAssignmentMap: IAllowedPermissionAssignmentMap =
      this._getAllowedPermissionAssignmentMap();

    executingUserPermissions.forEach((_permission: GlobalPermission) => {
      if (_permission in allowedPermissionAssignmentMap) {
        var allowedPermissionsToAssign: GlobalPermission[] = allowedPermissionAssignmentMap[_permission];

        result = _.union(result, allowedPermissionsToAssign);
      }
    });

    return result;
  }

  private _canExecutingUserAddPermissions(permissionsExecutingUserCanAdd: GlobalPermission[]): Promise<any> {
    var permissionsTheExecutingUserCannotAdd: GlobalPermission[] =
      _.difference(this._permissionsToAdd, permissionsExecutingUserCanAdd);

    if (permissionsTheExecutingUserCannotAdd.length < 1) {
      return Promise.resolve();
    } else {
      return this._rejectWithNotAllowedPermissionsToAdd(permissionsTheExecutingUserCannotAdd);
    }
  }

  private _rejectWithNotAllowedPermissionsToAdd(permissionsTheExecutingUserCannotAdd: GlobalPermission[]): Promise<any> {
    var permissionNames: string[] = _.map(permissionsTheExecutingUserCannotAdd, _permission => GlobalPermission[_permission]);

    var message = 'The executing user cannot add the next permissions: ' + permissionNames.join(', ');

    return Promise.reject(message);
  }
}
