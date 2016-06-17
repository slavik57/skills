import {TeamSkillUpvote} from "../../models/teamSkillUpvote";
import {TeamSkill} from "../../models/teamSkill";
import {TeamMember} from "../../models/teamMember";
import {UserGlobalPermissions} from "../../models/usersGlobalPermissions";
import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {Team} from "../../models/team";
import {Skill} from "../../models/skill";
import {User} from "../../models/user";

export interface ITestModels {
  users: User[];
  skills: Skill[];
  teams: Team[];

  skillPrerequisites: SkillPrerequisite[];
  userGlobalPermissions: UserGlobalPermissions[];
  teamMembers: TeamMember[];
  teamSkills: TeamSkill[];

  teamSkillUpvotes: TeamSkillUpvote[];
}
