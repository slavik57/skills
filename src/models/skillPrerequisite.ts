import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';

export interface ISkillPrerequisiteInfo {
  skill_id: number;
  skill_prerequisite_id: number;
}

export class SkillPrerequisite extends bookshelf.Model<SkillPrerequisite>{
  public attributes: ISkillPrerequisiteInfo;

  public get tableName() { return 'skills_prerequisites'; }
  public get idAttribute() { return 'id'; }

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

    return null;
  }
}

export class SkillPrerequisites extends bookshelf.Collection<SkillPrerequisite> {
  model = SkillPrerequisite;

  public static clearAll(): Promise<any> {
    var promises: Promise<SkillPrerequisite>[] = [];

    return new SkillPrerequisites().fetch().then((users: Collection<SkillPrerequisite>) => {
      users.each(skillPrerequisite => {
        var promise: Promise<SkillPrerequisite> = skillPrerequisite.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
