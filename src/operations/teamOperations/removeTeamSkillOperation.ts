import {AddRemoveTeamSkillOperationBase} from "../base/addRemoveTeamSkillOperationBase";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class RemoveTeamSkillOperation extends AddRemoveTeamSkillOperationBase {

  constructor(private _skillIdToRemove: number, teamId: number, executingUserId: number) {
    super(teamId, executingUserId);
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.removeTeamSkill(this.teamId, this._skillIdToRemove);
  }

}
