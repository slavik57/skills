import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamUsersOperation extends OperationBase<IUserOfATeam[]> {

  constructor(private _teamId) {
    super();
  }

  protected doWork(): Promise<IUserOfATeam[]> {
    return TeamsDataHandler.getTeamMembers(this._teamId);
  }

}
