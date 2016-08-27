import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillsByPartialSkillNameOperation extends OperationBase<Skill[]> {

  constructor(private partialSkillName: string, private maxNumberOfSkills: number = null) {
    super();
  }

  protected doWork(): bluebirdPromise<Skill[]> {
    return SkillsDataHandler.getSkillsByPartialSkillName(this.partialSkillName, this.maxNumberOfSkills);
  }

}
