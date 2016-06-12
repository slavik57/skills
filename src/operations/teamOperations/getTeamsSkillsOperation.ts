import {ISkillsOfATeam} from "../../models/interfaces/iSkillsOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetTeamsSkillsOperation extends OperationBase<ISkillsOfATeam[]> {

  constructor() {
    super();
  }

  protected doWork(): Promise<ISkillsOfATeam[]> {
    return TeamsDataHandler.getSkillsOfTeams();
  }

}
