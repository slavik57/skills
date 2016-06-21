import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../../models/interfaces/iSkillInfo";
import {SkillOperationBase} from "../base/skillOperationBase";
import * as bluebirdPromise from 'bluebird';

export class AddSkillOperation extends SkillOperationBase<Skill> {

  constructor(executingUserId: number, private _skillInfo: ISkillInfo) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<Skill> {
    return SkillsDataHandler.createSkill(this._skillInfo);
  }
}
