import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import {OperationBase} from "../base/operationBase";
import * as passwordHash from 'password-hash';
import * as bluebirdPromise from 'bluebird';

export class CreateAdminUserOperation extends OperationBase<User> {
  private _username: string;
  private _password: string;
  private _email: string;
  private _firstName: string;
  private _lastName: string;

  constructor() {
    super();

    this._username = 'admin';
    this._password = 'admin';
    this._email = null;
    this._firstName = 'admin';
    this._lastName = 'admin';
  }

  protected doWork(): bluebirdPromise<User> {
    var adminPermissions = [GlobalPermission.ADMIN];

    var userInfo: IUserInfo = {
      username: this._username,
      password_hash: this.hashThePassword(),
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName
    }

    return UserDataHandler.createUserWithPermissions(userInfo, adminPermissions);
  }

  private hashThePassword(): string {
    return passwordHash.generate(this._password);
  }

}
