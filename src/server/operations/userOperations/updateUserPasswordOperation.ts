import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import {UserOperationBase} from "../base/userOperationBase";
import * as bluebirdPromise from 'bluebird';
import * as passwordHash from 'password-hash';

export class UpdateUserPasswordOperation extends UserOperationBase {
  constructor(private userId: number,
    private userPassword: string,
    private newUserPassword: string) {

    super();
  }

  public doWork(): bluebirdPromise<User> {
    if (!this.newUserPassword) {
      return bluebirdPromise.reject('The new password cannot be empty');
    }

    var newPasswordHash = passwordHash.generate(this.newUserPassword);

    var user: User;

    return UserDataHandler.getUser(this.userId)
      .then((_user: User) => {
        user = _user;
      })
      .then(() => this._checkUserPassword(user))
      .then(() => UserDataHandler.updateUserPassword(this.userId, newPasswordHash))
      .catch((_error: any) => this._handleError(user, _error));
  }

  private _checkUserPassword(user: User): bluebirdPromise<void> {
    if (!passwordHash.verify(this.userPassword, user.attributes.password_hash)) {
      return bluebirdPromise.reject('Wrong password');
    }

    return bluebirdPromise.resolve();
  }

  private _handleError(user: User, error: any): bluebirdPromise<User> {
    if (!user) {
      return bluebirdPromise.reject('Something went wrong');
    } else {
      return bluebirdPromise.reject(error);
    }
  }
}
