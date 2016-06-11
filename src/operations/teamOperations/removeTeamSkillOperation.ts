import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {TeamOperationBase} from "../base/teamOperationBase";
import {OperationBase} from "../base/operationBase";

export class RemoveTeamSkillOperation extends TeamOperationBase {

  constructor(private _skillIdToRemove: number, teamId: number, executingUserId: number) {
    super(executingUserId, teamId);
  }

  protected get isRegularTeamMemberAlowedToExecute(): boolean {
    return true;
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.removeTeamSkill(this.teamId, this._skillIdToRemove);
  }

}
