import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillsOperation extends OperationBase<Skill[]> {

  constructor() {
    super();
  }

  protected doWork(): Promise<Skill[]> {
    return SkillsDataHandler.getSkills();
  }

}
