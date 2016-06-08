import {TeamSkill} from "../teamSkill";
import {Collection} from 'bookshelf';

export interface ITeamRelations {
  teamSkills: Collection<TeamSkill>;
}
