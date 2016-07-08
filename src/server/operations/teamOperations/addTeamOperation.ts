import {Team} from "../../models/team";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import {ITeamInfo} from "../../models/interfaces/iTeamInfo";
import * as bluebirdPromise from 'bluebird';

export class AddTeamOperation extends AuthenticatedOperationBase<Team> {
  constructor(private _teamInfo: ITeamInfo, executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  protected doWork(): bluebirdPromise<Team> {
    return TeamsDataHandler.createTeam(this._teamInfo, this.executingUserId);
  }
}
