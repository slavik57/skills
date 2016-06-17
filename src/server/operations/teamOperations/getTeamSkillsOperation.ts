import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamSkillsOperation extends OperationBase<ISkillOfATeam[]> {

  constructor(private _teamId) {
    super();
  }

  protected doWork(): Promise<ISkillOfATeam[]> {
    return TeamsDataHandler.getTeamSkills(this._teamId);
  }

}
