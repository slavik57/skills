import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillsPrerequisitesOperation extends OperationBase {

  constructor() {
    super();
  }

  protected doWork(): void | Promise<any> {
    return SkillsDataHandler.getSkillsToPrerequisitesMap();
  }

}
