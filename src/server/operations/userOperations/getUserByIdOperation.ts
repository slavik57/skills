import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetUserByIdOperation extends OperationBase<User> {

  constructor(private id: number) {
    super();
  }

  protected doWork(): bluebirdPromise<User> {
    return UserDataHandler.getUser(this.id);
  }

}
