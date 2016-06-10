import {SkillsDataHandler} from "../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "./base/skillOperationBase";

export class RemoveSkillOperation extends SkillOperationBase {

  constructor(executingUserId: number, private _skillId: number) {
    super(executingUserId);
  }

  protected doWork(): void | Promise<any> {
    return SkillsDataHandler.deleteSkill(this._skillId);
  }
}
