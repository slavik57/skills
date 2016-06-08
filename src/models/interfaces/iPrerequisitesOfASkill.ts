import {Skill} from "../skill";
import {Collection} from 'bookshelf';

export interface IPrerequisitesOfASkill {
  skill: Skill;
  prerequisiteSkillIds: number[];
}
