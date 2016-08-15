import {UnauthorizedError} from "../../../common/errors/unauthorizedError";
import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {AuthenticatedOperationBase} from "./authenticatedOperationBase";
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

export class TeamOperationBase<T> extends AuthenticatedOperationBase<T> {
  constructor(private _teamId, executingUserId: number) {
    super(executingUserId);
  }

  protected get teamId(): number { return this._teamId; }

  protected get isRegularTeamMemberAlowedToExecute(): boolean {
    return false;
  }

  public canExecute(): bluebirdPromise<any> {
    return super.canExecute()
      .catch(() => this._canExecuteBasedOnTeamMembership());
  }

  private _canExecuteBasedOnTeamMembership(): bluebirdPromise<any> {
    var teamUsersPromise: bluebirdPromise<IUserOfATeam[]> =
      TeamsDataHandler.getTeamMembers(this._teamId);

    return teamUsersPromise.then(
      (_teamUsers: IUserOfATeam[]) => this._isUserInTheTeamAndHasSufficientAdminRights(_teamUsers))
  }

  private _isUserInTheTeamAndHasSufficientAdminRights(teamUsers: IUserOfATeam[]): bluebirdPromise<any> {

    for (var i = 0; i < teamUsers.length; i++) {
      var teamUser: IUserOfATeam = teamUsers[i];

      var userId: number = teamUser.user.id;
      var isAdmin: boolean = teamUser.isAdmin;

      if (userId !== this.executingUserId) {
        continue;
      }

      return this._userHasSufficientAdminRights(isAdmin);
    }

    return bluebirdPromise.reject(this._createUnauthorizedError('The user is not in the team'));
  }

  private _userHasSufficientAdminRights(isAdmin: boolean): bluebirdPromise<any> {
    if (this.isRegularTeamMemberAlowedToExecute || isAdmin) {
      return bluebirdPromise.resolve();
    }

    return bluebirdPromise.reject(this._createUnauthorizedError('The user must be team admin'));
  }

  private _createUnauthorizedError(errorMessage: string): Error {
    var error = new UnauthorizedError();
    error.message = errorMessage;

    return error;
  }
}
