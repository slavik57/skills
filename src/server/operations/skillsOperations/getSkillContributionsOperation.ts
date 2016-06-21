import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillContributionsOperation extends OperationBase<Skill[]> {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<Skill[]> {
    return SkillsDataHandler.getSkillContributions(this._skillId);
  }

}
