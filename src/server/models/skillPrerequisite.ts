import {ModelBase} from "./modelBase";
import {Model, Collection, CollectionOptions, EventFunction} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../../common/typesValidator';
import {ISkillPrerequisiteInfo} from './interfaces/iSkillPrerequisiteInfo';

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

  public validateSkillPrerequisite(skillPrerequisite: SkillPrerequisite): Promise<boolean> {
    if (!TypesValidator.isInteger(skillPrerequisite.attributes.skill_id)) {
      return Promise.reject('The skill_id must be an integer');
    }

    if (!TypesValidator.isInteger(skillPrerequisite.attributes.skill_prerequisite_id)) {
      return Promise.reject('The skill_prerequisite_id be an integer');
    }

    if (skillPrerequisite.attributes.skill_id === skillPrerequisite.attributes.skill_prerequisite_id) {
      return Promise.reject('Skill can not be a prerequisite of itself');
    }

    return Promise.resolve(true);
  }
}

export class SkillPrerequisites extends bookshelf.Collection<SkillPrerequisite> {
  model = SkillPrerequisite;

  public static clearAll(): Promise<any> {
    return new SkillPrerequisites().query().del();
  }
}
