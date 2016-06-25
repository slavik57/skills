import {ModelBase} from "./modelBase";
import {Model, Collection, CollectionOptions, EventFunction} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import {TypesValidator} from '../../common/typesValidator';
import {ISkillPrerequisiteInfo} from './interfaces/iSkillPrerequisiteInfo';
import * as bluebirdPromise from 'bluebird';

export class SkillPrerequisite extends ModelBase<SkillPrerequisite, ISkillPrerequisiteInfo>{
  public get tableName(): string { return 'skills_prerequisites'; }

  public static get skillIdAttribute(): string { return 'skill_id'; }
  public static get skillPrerequisiteIdAttribute(): string { return 'skill_prerequisite_id'; }

  public static collection(prerequisites?: SkillPrerequisite[], options?: CollectionOptions<SkillPrerequisite>): Collection<SkillPrerequisite> {
    return new SkillPrerequisites(prerequisites, options);
  }

  public initialize(): void {
    this.on('saving', (skillPrerequisite: SkillPrerequisite) => this.validateSkillPrerequisite(skillPrerequisite));
  }

  public validateSkillPrerequisite(skillPrerequisite: SkillPrerequisite): bluebirdPromise<boolean> {
    if (!TypesValidator.isInteger(skillPrerequisite.attributes.skill_id)) {
      return bluebirdPromise.reject(this._createError('The skill_id must be an integer'));
    }

    if (!TypesValidator.isInteger(skillPrerequisite.attributes.skill_prerequisite_id)) {
      return bluebirdPromise.reject(this._createError('The skill_prerequisite_id be an integer'));
    }

    if (skillPrerequisite.attributes.skill_id === skillPrerequisite.attributes.skill_prerequisite_id) {
      return bluebirdPromise.reject(this._createError('Skill can not be a prerequisite of itself'));
    }

    return bluebirdPromise.resolve(true);
  }

  private _createError(errorMessage: string): Error {
    var error = new Error();
    error.message = errorMessage;
    return error;
  }
}

export class SkillPrerequisites extends bookshelf.Collection<SkillPrerequisite> {
  model = SkillPrerequisite;

  public static clearAll(): Promise<any> {
    return new SkillPrerequisites().query().del();
  }
}
