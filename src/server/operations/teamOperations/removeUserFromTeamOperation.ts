import {TeamMember} from "../../models/teamMember";
import {AddRemoveUserFromTeamOperationBase} from "../base/addRemoveUserFromTeamOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import * as bluebirdPromise from 'bluebird';

export class RemoveUserFromTeamOperation extends AddRemoveUserFromTeamOperationBase<TeamMember> {

  constructor(private _userIdToRemove: number,
    _teamId: number,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected doWork(): bluebirdPromise<TeamMember> {
    return TeamsDataHandler.removeTeamMember(this.teamId, this._userIdToRemove);
  }

}
