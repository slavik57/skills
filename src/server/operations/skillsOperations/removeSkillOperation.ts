import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";
import * as bluebirdPromise from 'bluebird';

export class RemoveSkillOperation extends SkillOperationBase<Skill> {

  constructor(executingUserId: number, private _skillId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<Skill> {
    return SkillsDataHandler.deleteSkill(this._skillId);
  }
}
