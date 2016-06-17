import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";

export class ModelInfoComparers {
  public static compareUserInfos(userInfo1: IUserInfo, userInfo2: IUserInfo): number {
    return userInfo1.username.localeCompare(userInfo2.username);
  }

  public static compareSkillInfos(skillInfo1: ISkillInfo, skillInfo2: ISkillInfo): number {
    return skillInfo1.name.localeCompare(skillInfo2.name);
  }

  public static compareSkillPrerequisiteInfos(skillPrerequisiteInfo1: ISkillPrerequisiteInfo,
    skillPrerequisiteInfo2: ISkillPrerequisiteInfo): number {

    return skillPrerequisiteInfo1.skill_id - skillPrerequisiteInfo2.skill_id;
  }

  public static compareTeamInfos(teamInfo1: ITeamInfo, teamInfo2: ITeamInfo): number {
    return teamInfo1.name.localeCompare(teamInfo2.name);
  }

  public static compareTeamSkillInfos(teamSkillInfo1: ITeamSkillInfo, teamSkillInfo2: ITeamSkillInfo): number {
    if (teamSkillInfo1.team_id !== teamSkillInfo2.team_id) {
      return teamSkillInfo1.team_id - teamSkillInfo2.team_id;
    }

    return teamSkillInfo1.skill_id - teamSkillInfo2.skill_id;
  }
}
