import {ISkillPrerequisiteInfo} from "../../models/interfaces/iSkillPrerequisiteInfo";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";

export class AddSkillPrerequisiteOperation extends SkillOperationBase {

  constructor(private _skillId: number, private _skillPrerequisiteId: number, executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): void | Promise<any> {
    var skillPrerequisiteInfo: ISkillPrerequisiteInfo = {
      skill_id: this._skillId,
      skill_prerequisite_id: this._skillPrerequisiteId
    };

    return SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
  }

}
