import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {TeamOperationBase} from "../base/teamOperationBase";

export class RemoveUserFromTeamOperation extends TeamOperationBase {

  constructor(private _userIdToRemove: number,
    _teamId: number,
    _executingUserId: number) {

    super(_executingUserId, _teamId);
  }

  public canExecute(): Promise<any> {
    return super.canExecute();
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.removeTeamMember(this.teamId, this._userIdToRemove);
  }

}
