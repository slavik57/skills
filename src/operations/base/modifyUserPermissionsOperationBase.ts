import {GetAllowedUserPermissionsToModifyOperation} from "../userOperations/getAllowedUserPermissionsToModifyOperation";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "./operationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as _ from 'lodash';

export class ModifyUserPermissionsOperationBase extends OperationBase {

  constructor(private _userIdToModifyPermissionsOf: number,
    private _permissionsToModify: GlobalPermission[],
    private _executingUserId: number) {

    super();
  }

  protected canExecute(): Promise<any> {
    var getAllowedUserPermissionsToModifyOperation =
      new GetAllowedUserPermissionsToModifyOperation(this._executingUserId)

    var listOfPermissionsTheExecutingUserCanModifyPromise: Promise<GlobalPermission[]> =
      getAllowedUserPermissionsToModifyOperation.execute();

    return listOfPermissionsTheExecutingUserCanModifyPromise
      .then((_permissionsExecutingUserCanModify: GlobalPermission[]) => {
        return this._canExecutingUserModifyPermissions(_permissionsExecutingUserCanModify);
      });
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
