import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillByNameOperation extends OperationBase<Skill> {

  constructor(private name: string) {
    super();
  }

  protected doWork(): bluebirdPromise<Skill> {
    return SkillsDataHandler.getSkillByName(this.name);
  }

}
