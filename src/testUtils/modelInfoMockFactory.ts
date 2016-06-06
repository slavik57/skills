import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {Team} from "../models/team";
import {TeamSkill} from "../models/teamSkill";
import {User} from "../models/user";
import {Skill} from "../models/skill";
import {ITeamSkillUpvoteInfo} from "../models/interfaces/iTeamSkillUpvoteInfo";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";

export class ModelInfoMockFactory {

  public static createUserInfo(userNumber: number): IUserInfo {
    return {
      username: 'username' + userNumber,
      password_hash: 'password_hash' + userNumber,
      email: 'email' + userNumber + '@gmail.com',
      firstName: 'firstName' + userNumber,
      lastName: 'lastName' + userNumber
    };
  }

  public static createSkillInfo(skillName: string): ISkillInfo {
    return {
      name: skillName
    };
  }

  public static createTeamInfo(teamName: string): ITeamInfo {
    return {
      name: teamName
    };
  }

  public static createTeamSkillInfo(team: Team, skill: Skill): ITeamSkillInfo {
    return {
      team_id: team.id,
      skill_id: skill.id
    };
  }

  public static createTeamSkillUpvoteInfo(teamSkill: TeamSkill, user: User): ITeamSkillUpvoteInfo {
    return {
      team_skill_id: teamSkill.id,
      user_id: user.id
    };
  }

  public static createTeamMemberInfo(team: Team, user: User): ITeamMemberInfo {
    return {
      team_id: team.id,
      user_id: user.id,
      is_admin: false
    }
  }

  public static createSkillPrerequisiteInfo(skill: Skill, skillPrerequisite: Skill): ISkillPrerequisiteInfo {
    return {
      skill_id: skill.id,
      skill_prerequisite_id: skillPrerequisite.id
    }
  }
}
