import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {SkillPrerequisite} from './skillPrerequisite';

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

  public getPrerequisiteSkills(): Collection<Skill> {
    return this.belongsToMany(Skill).through<Skill>(SkillPrerequisite, 'skill_id', 'skill_prerequisite_id');
  }

  public getContributingSkills(): Collection<Skill> {
    return this.belongsToMany(Skill).through<Skill>(SkillPrerequisite, 'skill_prerequisite_id', 'skill_id');
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
