import {Skill} from "../../models/skill";

export interface ISkillKnowledgeStatistics {
  skill: Skill;
  numberOfKnowingTeams: number;
  numberOfNotKnowingTeams: number;
}
