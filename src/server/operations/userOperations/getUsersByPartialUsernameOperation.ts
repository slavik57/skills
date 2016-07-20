import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetUsersByPartialUsernameOperation extends OperationBase<User[]> {

  constructor(private partialUsername: string) {
    super();
  }

  protected doWork(): bluebirdPromise<User[]> {
    return UserDataHandler.getUsersByPartialUsername(this.partialUsername);
  }

}
