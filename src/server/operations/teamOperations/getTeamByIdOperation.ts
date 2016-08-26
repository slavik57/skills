import {Team} from "../../models/team";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamByIdOperation extends OperationBase<Team> {

  constructor(private teamId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<Team> {
    return TeamsDataHandler.getTeam(this.teamId);
  }

}
