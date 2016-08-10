import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import {TeamOperationBase} from "../base/teamOperationBase";
import * as bluebirdPromise from 'bluebird';

export class UpdateTeamNameOperation extends TeamOperationBase<Team>{

  constructor(teamId: number,
    private newTeamName: string,
    executingUserId: number) {
    super(teamId, executingUserId);
  }

  protected doWork(): bluebirdPromise<Team> {
    var team: Team;

    return this._checkTeamNameNotExist()
      .then(() => TeamsDataHandler.updateTeamName(this.teamId, this.newTeamName));
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  private _checkTeamNameNotExist(): bluebirdPromise<void> {
    return TeamsDataHandler.getTeamByName(this.newTeamName)
      .then((_team: Team) => {
        if (!!_team &&
          _team.id !== this.teamId) {
          var error = new AlreadyExistsError();
          error.message = 'The team name is taken';
          return bluebirdPromise.reject(error);
        }
      });
  }

}
