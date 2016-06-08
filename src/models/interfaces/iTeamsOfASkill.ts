import {Team} from "../team";
import {Skill} from "../skill";

export interface ITeamsOfASkill {
  skill: Skill;
  teamsIds: number[];
}
