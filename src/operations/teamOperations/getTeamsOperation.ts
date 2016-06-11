import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamsOperation extends OperationBase {

  constructor() {
    super();
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.getTeams();
  }

}
