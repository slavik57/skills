import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamSkillsOperation extends OperationBase {

  constructor(private _teamId) {
    super();
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.getTeamSkills(this._teamId);
  }

}
