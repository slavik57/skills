import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';

export interface ISkillPrerequisiteInfo {
  skill_name: string;
  skill_prerequisite: string;
}

export class SkillPrerequisite extends bookshelf.Model<SkillPrerequisite>{
  public attributes: ISkillPrerequisiteInfo;

  public get tableName() { return 'skills_prerequisites'; }
  public get idAttribute() { return 'id'; }

  public initialize(): void {
    this.on('saving', (skillPrerequisite: SkillPrerequisite) => this.validateSkillPrerequisite(skillPrerequisite));
  }

  public validateSkillPrerequisite(skillPrerequisite: SkillPrerequisite): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(skillPrerequisite.attributes.skill_name, 1)) {
      return Promise.reject('The skill_name must not be empty');
    }

    if (!TypesValidator.isLongEnoughString(skillPrerequisite.attributes.skill_prerequisite, 1)) {
      return Promise.reject('The skill_prerequisite name must not be empty');
    }

    if (skillPrerequisite.attributes.skill_name === skillPrerequisite.attributes.skill_prerequisite) {
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
