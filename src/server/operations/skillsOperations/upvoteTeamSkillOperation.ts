import {TeamSkillUpvote} from "../../models/teamSkillUpvote";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

export class UpvoteTeamSkillOperation extends AuthenticatedOperationBase<TeamSkillUpvote> {
  constructor(private _skillIdToUpvote: number, private _teamId: number, executingUserId: number) {
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
        return this._upvoteTeamSkill(_teamSkills);
      });
  }

  private _upvoteTeamSkill(teamSkills: ISkillOfATeam[]): bluebirdPromise<TeamSkillUpvote> {
    var teamSkill: ISkillOfATeam =
      _.find(teamSkills, _teamSkill => _teamSkill.skill.id === this._skillIdToUpvote);

    if (!teamSkill) {
      return bluebirdPromise.reject('The skill is not part of the team skills');
    }

    return TeamsDataHandler.upvoteTeamSkill(teamSkill.teamSkill.id, this.executingUserId);
  }
}
