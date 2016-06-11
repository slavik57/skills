import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamUsersOperation extends OperationBase {

  constructor(private _teamId) {
    super();
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.getTeamMembers(this._teamId);
  }

}
