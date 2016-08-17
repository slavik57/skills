import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {User} from "../../models/user";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {TeamMember} from "../../models/teamMember";
import {AddRemoveUserFromTeamOperationBase} from "../base/addRemoveUserFromTeamOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import * as bluebirdPromise from 'bluebird';
import * as _ from 'lodash';

export class AddUserToTeamOperation extends AddRemoveUserFromTeamOperationBase<TeamMember> {

  constructor(private _usernameToAdd: string,
    _teamId: number,
    private _shouldBeAdmin: boolean,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected doWork(): bluebirdPromise<TeamMember> {
    var teamMemberInfo: ITeamMemberInfo;

    return UserDataHandler.getUserByUsername(this._usernameToAdd)
      .then((_user: User) => {
        if (!_user) {
          var error = new NotFoundError();
          error.message = 'User with username: [' + this._usernameToAdd + '] not found';
          return bluebirdPromise.reject(error);
        }

        return _user;
      })
      .then((_user: User) => {
        teamMemberInfo = {
          team_id: this.teamId,
          user_id: _user.id,
          is_admin: this._shouldBeAdmin
        }
      })
      .then(() => TeamsDataHandler.getTeamMembers(this.teamId))
      .then((_teamMembers: IUserOfATeam[]) => this._verifyUserNotInTeam(_teamMembers))
      .then(() => TeamsDataHandler.addTeamMember(teamMemberInfo))
  }

  private _verifyUserNotInTeam(teamMembers: IUserOfATeam[]): bluebirdPromise<any> {
    var user = _.find(teamMembers, _teamMember => _teamMember.user.attributes.username === this._usernameToAdd);

    if (!user) {
      return bluebirdPromise.resolve();
    } else {
      return bluebirdPromise.reject(new AlreadyExistsError());
    }
  }

}
