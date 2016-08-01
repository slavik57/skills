import {UnauthorizedError} from "../../../common/errors/unauthorizedError";
import {OperationBase} from "./operationBase";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as bluebirdPromise from 'bluebird';

export class AuthenticatedOperationBase<T> extends OperationBase<T> {
  constructor(private _executingUserId: number) {
    super();
  }

  protected get executingUserId(): number {
    return this._executingUserId;
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [];
  }

  public canExecute(): bluebirdPromise<any> {
    var userPermissionsPromise: Promise<GlobalPermission[]> =
      UserDataHandler.getUserGlobalPermissions(this.executingUserId);

    return super.canExecute()
      .then(() => userPermissionsPromise)
      .then((_permissions: GlobalPermission[]) => {
        if (this._userHasPermissions(_permissions)) {
          return Promise.resolve();
        } else {
          return Promise.reject(this._createUnautorizedError('User does not have sufficient permissions'));
        }
      });
  }

  private _createUnautorizedError(errorMessage: string): Error {
    var error = new UnauthorizedError();
    error.message = errorMessage;

    return error;
  }

  private _userHasPermissions(userPermissions: GlobalPermission[]): boolean {
    if (userPermissions.indexOf(GlobalPermission.ADMIN) >= 0) {
      return true;
    }

    var requiredPermissions: GlobalPermission[] = this.sufficientOperationGlobalPermissions;

    for (var i = 0; i < userPermissions.length; i++) {
      var userPermission: GlobalPermission = userPermissions[i];

      if (requiredPermissions.indexOf(userPermission) >= 0) {
        return true;
      }
    }

    return false;
  }
}
