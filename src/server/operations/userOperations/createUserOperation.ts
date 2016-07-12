import {UserOperationBase} from "../base/userOperationBase";
import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import * as passwordHash from 'password-hash';
import * as bluebirdPromise from 'bluebird';

export class CreateUserOperation extends UserOperationBase {

  constructor(private _username: string,
    private _password: string,
    private _email: string,
    private _firstName: string,
    private _lastName: string) {
    super();
  }

  protected doWork(): bluebirdPromise<User> {
    var readerPermissions = [GlobalPermission.READER];

    if (this._email === '') {
      this._email = undefined;
    }

    var userInfo: IUserInfo = {
      username: this._username,
      password_hash: this.hashThePassword(),
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName
    };

    return this.checkUsernameDoesNotExist(this._username)
      .then(() => this.checkEmailDoesNotExist(this._email))
      .then(() => UserDataHandler.createUserWithPermissions(userInfo, readerPermissions));
  }

  private hashThePassword(): string {
    return passwordHash.generate(this._password);
  }

}
