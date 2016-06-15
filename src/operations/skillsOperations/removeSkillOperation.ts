import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";

export class RemoveSkillOperation extends SkillOperationBase<Skill> {

  constructor(executingUserId: number, private _skillId: number) {
    super(executingUserId);
  }

  protected doWork(): Promise<Skill> {
    return SkillsDataHandler.deleteSkill(this._skillId);
  }
}
