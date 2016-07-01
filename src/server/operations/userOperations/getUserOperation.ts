import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetUserOperation extends OperationBase<User> {

  constructor(private username: string) {
    super();
  }

  protected doWork(): bluebirdPromise<User> {
    return UserDataHandler.getUserByUsername(this.username);
  }

}
