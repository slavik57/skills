import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as passwordHash from 'password-hash';
import * as bluebirdPromise from 'bluebird';

export class LoginUserOperation extends OperationBase<User> {

  constructor(private _username: string, private _passwrod: string) {
    super();
  }

  protected doWork(): bluebirdPromise<User> {
    return this._getUser()
      .then((_user: User) => this._verifyPassword(_user));
  }

  private _getUser(): bluebirdPromise<User> {
    return UserDataHandler.getUserByUsername(this._username)
      .then((_user: User) => {
        if (!_user) {
          return bluebirdPromise.reject('Invalid username');
        }

        return _user;
      });
  }

  private _verifyPassword(user: User): bluebirdPromise<User> {
    var isCorrectPassword: boolean =
      passwordHash.verify(this._passwrod, user.attributes.password_hash);

    if (isCorrectPassword) {
      return bluebirdPromise.resolve(user);
    } else {
      return bluebirdPromise.reject('Incorrect password');
    }
  }

}
