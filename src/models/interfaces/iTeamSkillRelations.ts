import {Skill} from "../skill";
import {TeamSkillUpvote} from "../teamSkillUpvote";
import {Team} from "../team";
import {Collection} from 'bookshelf';

export interface ITeamSkillRelations {
  team: Team;
  skill: Skill;
  upvotes: Collection<TeamSkillUpvote>;
}
