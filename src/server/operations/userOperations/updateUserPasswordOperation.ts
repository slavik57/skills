import {GlobalPermission} from "../../models/enums/globalPermission";
import {UnauthorizedError} from "../../../common/errors/unauthorizedError";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import {UserOperationBase} from "../base/userOperationBase";
import * as bluebirdPromise from 'bluebird';
import * as passwordHash from 'password-hash';

export class UpdateUserPasswordOperation extends UserOperationBase {
  private _shouldCheckUserPassword: boolean;

  constructor(private userId: number,
    private userPassword: string,
    private newUserPassword: string,
    private executingUserId: number) {
    super();

    this._shouldCheckUserPassword = true;
  }

  public canExecute(): bluebirdPromise<any> {
    if (!this.newUserPassword) {
      return bluebirdPromise.reject('The new password cannot be empty');
    }

    if (this.userId === this.executingUserId) {
      return bluebirdPromise.resolve();
    }

    return UserDataHandler.getUserGlobalPermissions(this.executingUserId)
      .then((_permissions: GlobalPermission[]) => {
        if (_permissions.indexOf(GlobalPermission.ADMIN) >= 0) {
          this._shouldCheckUserPassword = false;
          return bluebirdPromise.resolve();
        } else {
          return bluebirdPromise.reject(new UnauthorizedError());
        }
      });
  }

  public doWork(): bluebirdPromise<User> {
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
    if (this._shouldCheckUserPassword &&
      !passwordHash.verify(this.userPassword, user.attributes.password_hash)) {

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
