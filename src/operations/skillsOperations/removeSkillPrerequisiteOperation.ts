import {ISkillPrerequisiteInfo} from "../../models/interfaces/iSkillPrerequisiteInfo";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";

export class RemoveSkillPrerequisiteOperation extends SkillOperationBase {

  constructor(private _skillId: number, private _skillPrerequisiteId: number, executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): void | Promise<any> {
    return SkillsDataHandler.removeSkillPrerequisite(this._skillId, this._skillPrerequisiteId);
  }

}
