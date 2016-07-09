import {UserOperationBase} from "../base/userOperationBase";
import {User} from "../../models/user";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import * as passwordHash from 'password-hash';
import * as bluebirdPromise from 'bluebird';

export class UpdateUserDetailsOperation extends UserOperationBase {

  constructor(private _userId: number,
    private _username: string,
    private _email: string,
    private _firstName: string,
    private _lastName: string) {
    super();
  }

  protected doWork(): bluebirdPromise<User> {
    var user: User;

    return UserDataHandler.getUser(this._userId)
      .then((_user: User) => {
        user = _user;
      })
      .then(() => this._checkUsernameDoesNotExist(user))
      .then(() => this._checkEmailDoesNotExist(user))
      .then(() => UserDataHandler.updateUserDetails(this._userId,
        this._username,
        this._email,
        this._firstName,
        this._lastName));
  }

  private _checkUsernameDoesNotExist(user: User): bluebirdPromise<void> {
    if (user.attributes.username !== this._username) {
      return this.checkUsernameDoesNotExist(this._username)
    }

    return bluebirdPromise.resolve();
  }

  private _checkEmailDoesNotExist(user: User): bluebirdPromise<void> {
    if (user.attributes.email !== this._email) {
      return this.checkEmailDoesNotExist(this._email)
    }

    return bluebirdPromise.resolve();
  }

}
