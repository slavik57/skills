import {TeamOperationBase} from "../base/teamOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {IUserInfo} from "../../models/interfaces/iUserInfo";

export class AddUserToTeamOperation extends TeamOperationBase {

  constructor(private _userIdToAdd: number,
    _teamId: number,
    private _shouldBeAdmin: boolean,
    _executingUserId: number) {

    super(_executingUserId, _teamId);
  }

  public canExecute(): Promise<any> {
    return super.canExecute();
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

  protected doWork(): void | Promise<any> {
    var teamMemberInfo: ITeamMemberInfo = {
      team_id: this.teamId,
      user_id: this._userIdToAdd,
      is_admin: this._shouldBeAdmin
    }

    return TeamsDataHandler.addTeamMember(teamMemberInfo);
  }

}
