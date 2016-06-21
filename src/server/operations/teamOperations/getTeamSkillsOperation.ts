import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamSkillsOperation extends OperationBase<ISkillOfATeam[]> {

  constructor(private _teamId) {
    super();
  }

  protected doWork(): bluebirdPromise<ISkillOfATeam[]> {
    return TeamsDataHandler.getTeamSkills(this._teamId);
  }

}
