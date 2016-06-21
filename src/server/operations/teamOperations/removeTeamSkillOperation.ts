import {TeamSkill} from "../../models/teamSkill";
import {AddRemoveTeamSkillOperationBase} from "../base/addRemoveTeamSkillOperationBase";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class RemoveTeamSkillOperation extends AddRemoveTeamSkillOperationBase<TeamSkill> {

  constructor(private _skillIdToRemove: number, teamId: number, executingUserId: number) {
    super(teamId, executingUserId);
  }

  protected doWork(): bluebirdPromise<TeamSkill> {
    return TeamsDataHandler.removeTeamSkill(this.teamId, this._skillIdToRemove);
  }

}
