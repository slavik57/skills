import {TeamOperationBase} from "./teamOperationBase";

export class AddRemoveTeamSkillOperationBase extends TeamOperationBase {

  constructor(_teamId: number,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected get isRegularTeamMemberAlowedToExecute(): boolean {
    return true;
  }

}
