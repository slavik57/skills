import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamUsersOperation extends OperationBase<IUserOfATeam[]> {

  constructor(private _teamId) {
    super();
  }

  protected doWork(): bluebirdPromise<IUserOfATeam[]> {
    return TeamsDataHandler.getTeamMembers(this._teamId);
  }

}
