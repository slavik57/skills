import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import {OperationBase} from "./operationBase";
import * as bluebirdPromise from 'bluebird';

export class UserOperationBase extends OperationBase<User>  {
  constructor() {
    super();
  }

  protected checkUsernameDoesNotExist(username: string): bluebirdPromise<void> {
    return UserDataHandler.getUserByUsername(username)
      .then((user: User) => {
        if (user) {
          return bluebirdPromise.reject('The username is taken');
        }

        return bluebirdPromise.resolve();
      });
  }

  protected checkEmailDoesNotExist(email: string): bluebirdPromise<void> {
    if (!email) {
      return bluebirdPromise.resolve();
    }

    return UserDataHandler.getUserByEmail(email)
      .then((user: User) => {
        if (user) {
          return bluebirdPromise.reject('The email is taken');
        }

        return bluebirdPromise.resolve();
      });
  }
}
