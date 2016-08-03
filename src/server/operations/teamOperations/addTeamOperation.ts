import {ModifyTeamOperationBase} from "../base/modifyTeamOperationBase";
import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {Team} from "../../models/team";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {ITeamInfo} from "../../models/interfaces/iTeamInfo";
import * as bluebirdPromise from 'bluebird';

export class AddTeamOperation extends ModifyTeamOperationBase {
  constructor(private _teamInfo: ITeamInfo, executingUserId: number) {
    super(executingUserId);
  }

  public canExecute(): bluebirdPromise<any> {
    return super.canExecute()
      .then(() => this._checkIfTeamAlreadyExists(),
      (_error: any) => bluebirdPromise.reject(_error));
  }

  protected doWork(): bluebirdPromise<Team> {
    return TeamsDataHandler.createTeam(this._teamInfo, this.executingUserId);
  }

  private _checkIfTeamAlreadyExists(): bluebirdPromise<void> {
    return TeamsDataHandler.getTeamByName(this._teamInfo.name)
      .then((_team: Team) => {
        if (!_team) {
          return bluebirdPromise.resolve();
        }

        var error = new AlreadyExistsError();
        error.message = 'Team with the name ' + this._teamInfo.name + ' already exists';
        return bluebirdPromise.reject(error);
      }, () => {
        return bluebirdPromise.resolve();
      });
  }
}
