import {TeamSkillUpvote} from "../../models/teamSkillUpvote";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

export class DownvoteTeamSkillOperation extends AuthenticatedOperationBase<TeamSkillUpvote> {
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

  protected doWork(): bluebirdPromise<TeamSkillUpvote> {
    return TeamsDataHandler.getTeamSkills(this._teamId)
      .then((_teamSkills: ISkillOfATeam[]) => {
        return this._downvoteTeamSkill(_teamSkills);
      });
  }

  private _downvoteTeamSkill(teamSkills: ISkillOfATeam[]): bluebirdPromise<TeamSkillUpvote> {
    var teamSkill: ISkillOfATeam =
      _.find(teamSkills, _teamSkill => _teamSkill.skill.id === this._skillIdToDownvote);

    if (!teamSkill) {
      var error = new Error();
      error.message = 'The skill is not part of the team skills';
      return bluebirdPromise.reject(error);
    }

    return TeamsDataHandler.removeUpvoteForTeamSkill(teamSkill.teamSkill.id, this.executingUserId);
  }
}
