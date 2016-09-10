import {SkillSelfPrerequisiteError} from "../../../common/errors/skillSelfPrerequisiteError";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AuthenticatedOperationBase} from "./authenticatedOperationBase";
import * as bluebirdPromise from 'bluebird';

export class SkillOperationBase<T> extends AuthenticatedOperationBase<T> {

  constructor(executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.SKILLS_LIST_ADMIN];
  }

  protected getSkillByName(skillName: string): bluebirdPromise<Skill> {
    return SkillsDataHandler.getSkillByName(skillName)
      .then((_skill: Skill) => {
        if (!_skill) {
          var error = new NotFoundError();
          error.message = `Skill with name: [${skillName}] not found`;
          return bluebirdPromise.reject(error);
        }

        return _skill;
      })
  }

  protected verifySkillPrerequisiteNotCircularToItself(skillPrerequisite: Skill, skillId: number): Skill {
    if (skillPrerequisite.id === skillId) {
      throw new SkillSelfPrerequisiteError();
    }

    return skillPrerequisite;
  }

}
