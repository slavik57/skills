import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {OperationBase} from "./base/operationBase";
import {IUserInfo} from "../models/interfaces/iUserInfo";

export class CreateUserOperation extends OperationBase {

  constructor(private _userInfo: IUserInfo) {
    super();
  }

  public get userInfo(): IUserInfo { return this._userInfo; }

  protected doWork(): void | Promise<any> {
    return UserDataHandler.createUser(this._userInfo);
  }

}
