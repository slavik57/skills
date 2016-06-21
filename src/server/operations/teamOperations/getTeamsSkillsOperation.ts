import {ISkillsOfATeam} from "../../models/interfaces/iSkillsOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamsSkillsOperation extends OperationBase<ISkillsOfATeam[]> {

  constructor() {
    super();
  }

  protected doWork(): bluebirdPromise<ISkillsOfATeam[]> {
    return TeamsDataHandler.getSkillsOfTeams();
  }

}
