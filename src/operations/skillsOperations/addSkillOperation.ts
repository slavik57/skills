import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../../models/interfaces/iSkillInfo";
import {SkillOperationBase} from "../base/skillOperationBase";

export class AddSkillOperation extends SkillOperationBase<Skill> {

  constructor(executingUserId: number, private _skillInfo: ISkillInfo) {
    super(executingUserId);
  }

  protected doWork(): Promise<Skill> {
    return SkillsDataHandler.createSkill(this._skillInfo);
  }
}
