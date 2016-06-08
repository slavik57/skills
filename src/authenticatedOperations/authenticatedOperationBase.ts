import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {GlobalPermission} from "../models/enums/globalPermission";
export class AuthenticatedOperationBase {
  constructor(private _userId: number) {
  }

  protected get userId(): number { return this._userId; }
  protected get operationRequiredPermissions(): GlobalPermission[] { return []; }

  public execute(): Promise<any> {
    var userPermissionsPromise: Promise<GlobalPermission[]> =
      UserDataHandler.getUserGlobalPermissions(this.userId);

    return userPermissionsPromise.then((_permissions: GlobalPermission[]) => {
      return this._executeIfSufficientPermissions(_permissions);
    })
  }

  protected executeOperation(): void | Promise<any> {
    throw 'Override the executeOperation method with the operation execution';
  }

  private _executeIfSufficientPermissions(userPermissions: GlobalPermission[]): void | Promise<any> {
    if (!this._userHasPermissions(userPermissions)) {
      return Promise.reject('The user does not have sufficient permissions');
    }

    return this.executeOperation();
  }

  private _userHasPermissions(userPermissions: GlobalPermission[]): boolean {
    if (userPermissions.indexOf(GlobalPermission.ADMIN) >= 0) {
      return true;
    }

    var requiredPermissions: GlobalPermission[] = this.operationRequiredPermissions;

    for (var i = 0; i < userPermissions.length; i++) {
      var userPermission: GlobalPermission = userPermissions[i];

      if (requiredPermissions.indexOf(userPermission) >= 0) {
        return true;
      }
    }

    return false;
  }
}
