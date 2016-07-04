import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import * as passwordHash from 'password-hash';
import * as bluebirdPromise from 'bluebird';

export class CreateUserOperation extends OperationBase<User> {

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

    return this._checkUsernameDoesNotExist()
      .then(() => this.checkEmailDoesNotExist())
      .then(() => UserDataHandler.createUserWithPermissions(userInfo, readerPermissions));
  }

  private hashThePassword(): string {
    return passwordHash.generate(this._password);
  }

  private _checkUsernameDoesNotExist(): bluebirdPromise<void> {
    return UserDataHandler.getUserByUsername(this._username)
      .then((user: User) => {
        if (user) {
          return bluebirdPromise.reject('The username is taken');
        }

        return bluebirdPromise.resolve();
      });
  }

  private checkEmailDoesNotExist(): bluebirdPromise<void> {
    if (!this._email) {
      return bluebirdPromise.resolve();
    }

    return UserDataHandler.getUserByEmail(this._email)
      .then((user: User) => {
        if (user) {
          return bluebirdPromise.reject('The email is taken');
        }

        return bluebirdPromise.resolve();
      });
  }

}
