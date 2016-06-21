import {TeamMember} from "../../models/teamMember";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {TeamOperationBase} from "../base/teamOperationBase";
import * as bluebirdPromise from 'bluebird';

export class UpdateUserTeamAdminRightsOperation extends TeamOperationBase<TeamMember> {

  constructor(private _userIdToModify: number,
    _teamId: number,
    private _shouldBeAdmin: boolean,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  public static canUpdateUserRights(teamId: number, executingUserId: number): bluebirdPromise<any> {
    return new UpdateUserTeamAdminRightsOperation(-1, teamId, false, executingUserId).canExecute();
  }

  protected doWork(): bluebirdPromise<TeamMember> {
    return TeamsDataHandler.setAdminRights(this.teamId, this._userIdToModify, this._shouldBeAdmin);
  }

}
