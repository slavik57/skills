import {SkillPrerequisite} from "../skillPrerequisite";
import {TeamSkill} from "../teamSkill";
import {Collection} from 'bookshelf';

export interface ISkillRelations {
  teamSkills: Collection<TeamSkill>;
  skillPrerequisites: Collection<SkillPrerequisite>
}
