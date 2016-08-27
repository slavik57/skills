import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillByIdOperation extends OperationBase<Skill> {

  constructor(private skillId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<Skill> {
    return SkillsDataHandler.getSkill(this.skillId);
  }

}
