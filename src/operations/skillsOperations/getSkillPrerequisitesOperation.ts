import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillPrerequisitesOperation extends OperationBase {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): void | Promise<any> {
    return SkillsDataHandler.getSkillPrerequisites(this._skillId);
  }

}
