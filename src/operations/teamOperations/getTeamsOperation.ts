import {Team} from "../../models/team";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamsOperation extends OperationBase<Team[]> {

  constructor() {
    super();
  }

  protected doWork(): Promise<Team[]> {
    return TeamsDataHandler.getTeams();
  }

}
