import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import * as passwordHash from 'password-hash';

export class CreateUserOperation extends OperationBase<User> {

  constructor(private _username: string,
    private _password: string,
    private _email: string,
    private _firstName: string,
    private _lastName: string) {
    super();
  }

  protected doWork(): Promise<User> {
    var readerPermissions = [GlobalPermission.READER];

    var userInfo: IUserInfo = {
      username: this._username,
      password_hash: this.hashThePassword(),
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName
    }

    return UserDataHandler.createUserWithPermissions(userInfo, readerPermissions);
  }

  private hashThePassword(): string {
    return passwordHash.generate(this._password);
  }

}
