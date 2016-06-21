import {TeamMember} from "../../models/teamMember";
import {AddRemoveUserFromTeamOperationBase} from "../base/addRemoveUserFromTeamOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import * as bluebirdPromise from 'bluebird';

export class AddUserToTeamOperation extends AddRemoveUserFromTeamOperationBase<TeamMember> {

  constructor(private _userIdToAdd: number,
    _teamId: number,
    private _shouldBeAdmin: boolean,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected doWork(): bluebirdPromise<TeamMember> {
    var teamMemberInfo: ITeamMemberInfo = {
      team_id: this.teamId,
      user_id: this._userIdToAdd,
      is_admin: this._shouldBeAdmin
    }

    return TeamsDataHandler.addTeamMember(teamMemberInfo);
  }

}
