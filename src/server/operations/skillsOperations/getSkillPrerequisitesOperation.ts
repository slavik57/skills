import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillPrerequisitesOperation extends OperationBase<Skill[]> {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<Skill[]> {
    return SkillsDataHandler.getSkillPrerequisites(this._skillId);
  }

}
