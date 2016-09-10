import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {Skill} from "../../models/skill";
import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {ISkillPrerequisiteInfo} from "../../models/interfaces/iSkillPrerequisiteInfo";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillOperationBase} from "../base/skillOperationBase";
import * as bluebirdPromise from 'bluebird';
import * as _ from 'lodash';

export class AddSkillContributionOperation extends SkillOperationBase<SkillPrerequisite> {

  constructor(private _skillId: number, private _skillContributionName: string, executingUserId: number) {
    super(executingUserId);
  }

  protected doWork(): bluebirdPromise<SkillPrerequisite> {
    var skillPrerequisiteInfo: ISkillPrerequisiteInfo;

    return this.getSkillByName(this._skillContributionName)
      .then((_skill: Skill) => this.verifySkillPrerequisiteNotCircularToItself(_skill, this._skillId))
      .then((_skill: Skill) => {
        skillPrerequisiteInfo = {
          skill_id: _skill.id,
          skill_prerequisite_id: this._skillId
        }
      })
      .then(() => SkillsDataHandler.getSkillContributions(this._skillId))
      .then((_contributions: Skill[]) => this._verifyNotAlreadyAContribution(_contributions))
      .then(() => SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo))
  }

  private _verifyNotAlreadyAContribution(skills: Skill[]): bluebirdPromise<any> {
    var contribution = _.find(skills, _skill => _skill.attributes.name === this._skillContributionName);

    if (!contribution) {
      return bluebirdPromise.resolve();
    } else {
      return bluebirdPromise.reject(new AlreadyExistsError());
    }
  }

}
