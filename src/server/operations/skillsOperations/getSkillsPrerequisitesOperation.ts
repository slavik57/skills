import {IPrerequisitesOfASkill} from "../../models/interfaces/iPrerequisitesOfASkill";
import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillsPrerequisitesOperation extends OperationBase<IPrerequisitesOfASkill[]> {

  constructor() {
    super();
  }

  protected doWork(): bluebirdPromise<IPrerequisitesOfASkill[]> {
    return SkillsDataHandler.getSkillsToPrerequisitesMap();
  }

}
