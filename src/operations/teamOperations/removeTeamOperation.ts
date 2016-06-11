import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";

export class RemoveTeamOperation extends AuthenticatedOperationBase {
  constructor(private _teamIdToRemove: number, executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.deleteTeam(this._teamIdToRemove);
  }
}
