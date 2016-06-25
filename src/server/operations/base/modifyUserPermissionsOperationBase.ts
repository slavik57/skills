import {GetAllowedUserPermissionsToModifyOperation} from "../userOperations/getAllowedUserPermissionsToModifyOperation";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "./operationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

export class ModifyUserPermissionsOperationBase<T> extends OperationBase<T> {

  constructor(private _userIdToModifyPermissionsOf: number,
    private _permissionsToModify: GlobalPermission[],
    private _executingUserId: number) {

    super();
  }

  public canExecute(): bluebirdPromise<any> {
    var getAllowedUserPermissionsToModifyOperation =
      new GetAllowedUserPermissionsToModifyOperation(this._executingUserId)

    var listOfPermissionsTheExecutingUserCanModifyPromise: bluebirdPromise<GlobalPermission[]> =
      getAllowedUserPermissionsToModifyOperation.execute();

    return listOfPermissionsTheExecutingUserCanModifyPromise
      .then((_permissionsExecutingUserCanModify: GlobalPermission[]) => {
        return this._canExecutingUserModifyPermissions(_permissionsExecutingUserCanModify);
      });
  }

  private _canExecutingUserModifyPermissions(permissionsExecutingUserCanModify: GlobalPermission[]): bluebirdPromise<any> {
    var permissionsTheExecutingUserCannotAdd: GlobalPermission[] =
      _.difference(this._permissionsToModify, permissionsExecutingUserCanModify);

    if (permissionsTheExecutingUserCannotAdd.length < 1) {
      return bluebirdPromise.resolve();
    } else {
      return this._rejectWithNotAllowedPermissionsToModify(permissionsTheExecutingUserCannotAdd);
    }
  }

  private _rejectWithNotAllowedPermissionsToModify(permissionsTheExecutingUserCannotAdd: GlobalPermission[]): bluebirdPromise<any> {
    var permissionNames: string[] = _.map(permissionsTheExecutingUserCannotAdd, _permission => GlobalPermission[_permission]);

    var error = new Error();
    error.message = 'The executing user cannot modify the permissions: ' + permissionNames.join(', ');
    return bluebirdPromise.reject(error);
  }

}
