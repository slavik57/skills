import {TeamSkill} from "../teamSkill";
import {Collection} from 'bookshelf';

export interface ISkillRelations {
  teamSkills: Collection<TeamSkill>
}
