import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../../models/interfaces/iSkillInfo";
import {SkillOperationBase} from "../base/skillOperationBase";

export class AddSkillOperation extends SkillOperationBase {

  constructor(executingUserId: number, private _skillInfo: ISkillInfo) {
    super(executingUserId);
  }

  protected doWork(): void | Promise<any> {
    return SkillsDataHandler.createSkill(this._skillInfo);
  }
}
