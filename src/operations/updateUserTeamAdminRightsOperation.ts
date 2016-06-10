import {GlobalPermission} from "../models/enums/globalPermission";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
import {TeamOperationBase} from "./base/teamOperationBase";

export class UpdateUserTeamAdminRightsOperation extends TeamOperationBase {

  constructor(private _userIdToModify: number,
    _teamId: number,
    private _shouldBeAdmin: boolean,
    _executingUserId: number) {

    super(_executingUserId, _teamId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.setAdminRights(this.teamId, this._userIdToModify, this._shouldBeAdmin);
  }

}
