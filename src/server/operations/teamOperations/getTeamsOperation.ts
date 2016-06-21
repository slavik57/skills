import {Team} from "../../models/team";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamsOperation extends OperationBase<Team[]> {

  constructor() {
    super();
  }

  protected doWork(): bluebirdPromise<Team[]> {
    return TeamsDataHandler.getTeams();
  }

}
