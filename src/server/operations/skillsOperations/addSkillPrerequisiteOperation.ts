import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {Skill} from "../../models/skill";
import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {ISkillPrerequisiteInfo} from "../../models/interfaces/iSkillPrerequisiteInfo";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";
import * as bluebirdPromise from 'bluebird';
import * as _ from 'lodash';

export class AddSkillPrerequisiteOperation extends SkillOperationBase<SkillPrerequisite> {

  constructor(private _skillId: number, private _skillPrerequisiteName: string, executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<SkillPrerequisite> {
    var skillPrerequisiteInfo: ISkillPrerequisiteInfo;

    return this.getSkillByName(this._skillPrerequisiteName)
      .then((_skill: Skill) => this.verifySkillPrerequisiteNotCircularToItself(_skill, this._skillId))
      .then((_skill: Skill) => {
        skillPrerequisiteInfo = {
          skill_id: this._skillId,
          skill_prerequisite_id: _skill.id
        }
      })
      .then(() => SkillsDataHandler.getSkillPrerequisites(this._skillId))
      .then((_prerequisites: Skill[]) => this._verifyNotAlreadyAPrerequisite(_prerequisites))
      .then(() => SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo))
  }

  private _verifyNotAlreadyAPrerequisite(skills: Skill[]): bluebirdPromise<any> {
    var prerequisite = _.find(skills, _skill => _skill.attributes.name === this._skillPrerequisiteName);

    if (!prerequisite) {
      return bluebirdPromise.resolve();
    } else {
      return bluebirdPromise.reject(new AlreadyExistsError());
    }
  }

}
