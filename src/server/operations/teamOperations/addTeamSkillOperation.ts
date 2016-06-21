import {TeamSkill} from "../../models/teamSkill";
import {AddRemoveTeamSkillOperationBase} from "../base/addRemoveTeamSkillOperationBase";
import {ITeamSkillInfo} from "../../models/interfaces/iTeamSkillInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import * as bluebirdPromise from 'bluebird';

export class AddTeamSkillOperation extends AddRemoveTeamSkillOperationBase<TeamSkill> {

  constructor(private _skillIdToAdd: number, teamId: number, executingUserId: number) {
    super(teamId, executingUserId);
  }

  protected doWork(): bluebirdPromise<TeamSkill> {
    var teamSkillInfo: ITeamSkillInfo = {
      team_id: this.teamId,
      skill_id: this._skillIdToAdd
    };

    return TeamsDataHandler.addTeamSkill(teamSkillInfo);
  }

}
