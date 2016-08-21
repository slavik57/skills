import {NotFoundError} from "../../../common/errors/notFoundError";
import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {TeamMember} from "../../models/teamMember";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {TeamOperationBase} from "../base/teamOperationBase";
import * as bluebirdPromise from 'bluebird';
import * as _ from 'lodash';

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
    return this._verifyUserExists()
      .then(() => TeamsDataHandler.setAdminRights(this.teamId, this._userIdToModify, this._shouldBeAdmin));
  }

  private _verifyUserExists(): bluebirdPromise<void> {
    return this._getTeamMemberToModify()
      .then((_teamMember: IUserOfATeam) => {
        if (_teamMember) {
          return bluebirdPromise.resolve();
        } else {
          var error = new NotFoundError();
          error.message = 'The user is not in the team';
          return bluebirdPromise.reject(error);
        }
      });
  }

  private _getTeamMemberToModify(): bluebirdPromise<IUserOfATeam> {
    return TeamsDataHandler.getTeamMembers(this.teamId)
      .then((_teamMembers: IUserOfATeam[]) =>
        _.find(_teamMembers, _member => _member.user.id === this._userIdToModify))
  }

}
