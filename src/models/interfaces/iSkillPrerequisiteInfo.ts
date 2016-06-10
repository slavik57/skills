import {IModelInfo} from "./iModelInfo";

export interface ISkillPrerequisiteInfo extends IModelInfo {
  skill_id: number;
  skill_prerequisite_id: number;
}
