import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillsOperation extends OperationBase<Skill[]> {

  constructor() {
    super();
  }

  protected doWork(): bluebirdPromise<Skill[]> {
    return SkillsDataHandler.getSkills();
  }

}
