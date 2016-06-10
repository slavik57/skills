import {GlobalPermission} from "../models/enums/globalPermission";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {OperationBase} from "./base/operationBase";
import {IUserInfo} from "../models/interfaces/iUserInfo";

export class CreateUserOperation extends OperationBase {

  constructor(private _userInfo: IUserInfo) {
    super();
  }

  public get userInfo(): IUserInfo { return this._userInfo; }

  protected doWork(): void | Promise<any> {
    var readerPermissions = [GlobalPermission.READER];

    return UserDataHandler.createUserWithPermissions(this._userInfo, readerPermissions);
  }

}
