import {TeamSkill} from "../../models/teamSkill";
import {AddRemoveTeamSkillOperationBase} from "../base/addRemoveTeamSkillOperationBase";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class RemoveTeamSkillOperation extends AddRemoveTeamSkillOperationBase<TeamSkill> {

  constructor(private _skillIdToRemove: number, teamId: number, executingUserId: number) {
    super(teamId, executingUserId);
  }

  protected doWork(): Promise<TeamSkill> {
    return TeamsDataHandler.removeTeamSkill(this.teamId, this._skillIdToRemove);
  }

}
