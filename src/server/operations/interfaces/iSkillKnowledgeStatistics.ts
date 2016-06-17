import {IKnowledgeStatistics} from "./iKnowledgeStatistics";
import {Skill} from "../../models/skill";

export interface ISkillKnowledgeStatistics extends IKnowledgeStatistics {
  skill: Skill;
}
