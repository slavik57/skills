import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
import {AuthenticatedOperationBase} from "./authenticatedOperationBase";
import * as _ from 'lodash';

export class TeamOperationBase extends AuthenticatedOperationBase {
  constructor(userId: number, private _teamId) {
    super(userId);
  }

  protected get teamId(): number { return this._teamId; }

  protected get isRegularTeamMemberAlowedToExecute(): boolean { return true; }

  protected canExecute(): Promise<any> {
    return super.canExecute()
      .catch(() => this._canExecuteBasedOnTeamMembership());
  }

  private _canExecuteBasedOnTeamMembership(): Promise<any> {
    var teamUsersPromise: Promise<IUserOfATeam[]> =
      TeamsDataHandler.getTeamMembers(this._teamId);

    return teamUsersPromise.then(
      (_teamUsers: IUserOfATeam[]) => this._isUserInTheTeamAndHasSufficientAdminRights(_teamUsers))
  }

  private _isUserInTheTeamAndHasSufficientAdminRights(teamUsers: IUserOfATeam[]): Promise<any> {

    for (var i = 0; i < teamUsers.length; i++) {
      var teamUser: IUserOfATeam = teamUsers[i];

      var userId: number = teamUser.user.id;
      var isAdmin: boolean = teamUser.isAdmin;

      if (userId !== this.userId) {
        continue;
      }

      return this._userHasSufficientAdminRights(isAdmin);
    }

    return Promise.reject('The user is not in the team');
  }

  private _userHasSufficientAdminRights(isAdmin: boolean): Promise<any> {
    if (this.isRegularTeamMemberAlowedToExecute || isAdmin) {
      return Promise.resolve();
    }

    return Promise.reject('The user must be team admin');
  }
}
