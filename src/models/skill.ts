import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';

export interface ISkillInfo {
  name: string;
}

export class Skill extends bookshelf.Model<Skill>{
  public attributes: ISkillInfo;

  public get tableName() { return 'skills'; }
  public get idAttribute() { return 'id'; }

  public initialize(): void {
    this.on('saving', (skill: Skill) => this.validateSkill(skill));
  }

  public validateSkill(skill: Skill): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(skill.attributes.name, 1)) {
      return Promise.reject('The skill name must not be empty');
    }

    return null;
  }
}

export class Skills extends bookshelf.Collection<Skill> {
  model = Skill;

  public static clearAll(): Promise<any> {
    var promises: Promise<Skill>[] = []

    return new Skills().fetch().then((skills: Collection<Skill>) => {
      skills.each(skill => {
        var promise: Promise<Skill> = skill.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
