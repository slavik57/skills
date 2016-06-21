import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {ISkillPrerequisiteInfo} from "../../models/interfaces/iSkillPrerequisiteInfo";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";
import * as bluebirdPromise from 'bluebird';

export class RemoveSkillPrerequisiteOperation extends SkillOperationBase<SkillPrerequisite> {

  constructor(private _skillId: number, private _skillPrerequisiteId: number, executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<SkillPrerequisite> {
    return SkillsDataHandler.removeSkillPrerequisite(this._skillId, this._skillPrerequisiteId);
  }

}
