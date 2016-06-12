import {TeamSkill} from "../../models/teamSkill";
import {AddRemoveTeamSkillOperationBase} from "../base/addRemoveTeamSkillOperationBase";
import {ITeamSkillInfo} from "../../models/interfaces/iTeamSkillInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";

export class AddTeamSkillOperation extends AddRemoveTeamSkillOperationBase<TeamSkill> {

  constructor(private _skillIdToAdd: number, teamId: number, executingUserId: number) {
    super(teamId, executingUserId);
  }

  protected doWork(): Promise<TeamSkill> {
    var teamSkillInfo: ITeamSkillInfo = {
      team_id: this.teamId,
      skill_id: this._skillIdToAdd
    };

    return TeamsDataHandler.addTeamSkill(teamSkillInfo);
  }

}
