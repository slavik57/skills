import {ISkillOfATeam} from "./iSkillOfATeam";
import {Team} from "../team";

export interface ISkillsOfATeam {
  team: Team;
  skills: ISkillOfATeam[];
}
