import {Team} from "../../models/team";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as bluebirdPromise from 'bluebird';

export class RemoveTeamOperation extends AuthenticatedOperationBase<Team> {
  constructor(private _teamIdToRemove: number, executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  protected doWork(): bluebirdPromise<Team> {
    return TeamsDataHandler.deleteTeam(this._teamIdToRemove);
  }
}
