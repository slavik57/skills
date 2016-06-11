import {AddRemoveUserFromTeamOperationBase} from "../base/addRemoveUserFromTeamOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";

export class RemoveUserFromTeamOperation extends AddRemoveUserFromTeamOperationBase {

  constructor(private _userIdToRemove: number,
    _teamId: number,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.removeTeamMember(this.teamId, this._userIdToRemove);
  }

}
