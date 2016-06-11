import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetUsersOperation extends OperationBase {

  constructor() {
    super();
  }

  protected doWork(): void | Promise<any> {
    return UserDataHandler.getUsers();
  }

}
