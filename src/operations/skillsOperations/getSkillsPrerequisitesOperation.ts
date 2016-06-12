import {IPrerequisitesOfASkill} from "../../models/interfaces/iPrerequisitesOfASkill";
import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillsPrerequisitesOperation extends OperationBase<IPrerequisitesOfASkill[]> {

  constructor() {
    super();
  }

  protected doWork(): Promise<IPrerequisitesOfASkill[]> {
    return SkillsDataHandler.getSkillsToPrerequisitesMap();
  }

}
