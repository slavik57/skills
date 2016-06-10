import {OperationBase} from "./operationBase";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";

export class AuthenticatedOperationBase extends OperationBase {
  constructor(private _executingUserId: number) {
    super();
  }

  protected get executingUserId(): number { return this._executingUserId; }
  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] { return []; }

  protected canExecute(): Promise<any> {
    var userPermissionsPromise: Promise<GlobalPermission[]> =
      UserDataHandler.getUserGlobalPermissions(this.executingUserId);

    return super.canExecute()
      .then(() => userPermissionsPromise)
      .then((_permissions: GlobalPermission[]) => {
        if (this._userHasPermissions(_permissions)) {
          return Promise.resolve();
        } else {
          return Promise.reject('User does not have sufficient permissions');
        }
      });
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
