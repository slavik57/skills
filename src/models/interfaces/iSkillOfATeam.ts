import {TeamSkill} from "../teamSkill";
import {Skill} from '../skill';

export interface ISkillOfATeam {
  skill: Skill;
  teamSkill: TeamSkill;
  upvotingUserIds: number[];
}
