import {AddRemoveUserFromTeamOperationBase} from "../base/addRemoveUserFromTeamOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {IUserInfo} from "../../models/interfaces/iUserInfo";

export class AddUserToTeamOperation extends AddRemoveUserFromTeamOperationBase {

  constructor(private _userIdToAdd: number,
    _teamId: number,
    private _shouldBeAdmin: boolean,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected doWork(): void | Promise<any> {
    var teamMemberInfo: ITeamMemberInfo = {
      team_id: this.teamId,
      user_id: this._userIdToAdd,
      is_admin: this._shouldBeAdmin
    }

    return TeamsDataHandler.addTeamMember(teamMemberInfo);
  }

}
