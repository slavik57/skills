import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillPrerequisitesOperation extends OperationBase<Skill[]> {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): Promise<Skill[]> {
    return SkillsDataHandler.getSkillPrerequisites(this._skillId);
  }

}
