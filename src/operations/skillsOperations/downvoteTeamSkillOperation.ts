import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import * as _ from 'lodash';

export class DownvoteTeamSkillOperation extends AuthenticatedOperationBase {
  constructor(private _skillIdToDownvote: number, private _teamId: number, executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [
      GlobalPermission.READER,
      GlobalPermission.SKILLS_LIST_ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN
    ];
  }

  protected doWork(): void | Promise<any> {
    return TeamsDataHandler.getTeamSkills(this._teamId)
      .then((_teamSkills: ISkillOfATeam[]) => {
        return this._downvoteTeamSkill(_teamSkills);
      });
  }

  private _downvoteTeamSkill(teamSkills: ISkillOfATeam[]): Promise<any> {
    var teamSkill: ISkillOfATeam =
      _.find(teamSkills, _teamSkill => _teamSkill.skill.id === this._skillIdToDownvote);

    if (!teamSkill) {
      return Promise.reject('The skill is not part of the team skills');
    }

    return TeamsDataHandler.removeUpvoteForTeamSkill(teamSkill.teamSkill.id, this.executingUserId);
  }
}
