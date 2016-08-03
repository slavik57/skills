import {ModifyTeamOperationBase} from "../base/modifyTeamOperationBase";
import {Team} from "../../models/team";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as bluebirdPromise from 'bluebird';

export class RemoveTeamOperation extends ModifyTeamOperationBase {
  constructor(private _teamIdToRemove: number, executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<Team> {
    return TeamsDataHandler.deleteTeam(this._teamIdToRemove);
  }
}
