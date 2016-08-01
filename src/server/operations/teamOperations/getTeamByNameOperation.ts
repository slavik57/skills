import {Team} from "../../models/team";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamByNameOperation extends OperationBase<Team> {

  constructor(private name: string) {
    super();
  }

  protected doWork(): bluebirdPromise<Team> {
    return TeamsDataHandler.getTeamByName(this.name);
  }

}
