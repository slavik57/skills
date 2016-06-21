import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetUsersOperation extends OperationBase<User[]> {

  constructor() {
    super();
  }

  protected doWork(): bluebirdPromise<User[]> {
    return UserDataHandler.getUsers();
  }

}
