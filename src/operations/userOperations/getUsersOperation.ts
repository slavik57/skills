import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetUsersOperation extends OperationBase<User[]> {

  constructor() {
    super();
  }

  protected doWork(): Promise<User[]> {
    return UserDataHandler.getUsers();
  }

}
