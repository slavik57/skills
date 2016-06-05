import {Team} from "./team";
import {ITeamOfASkill} from "./interfaces/iTeamOfASkill";
import {ITeamSkillPivot} from "./interfaces/iTeamSkillPivot";
import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {TypesValidator} from '../commonUtils/typesValidator';
import {SkillPrerequisite} from './skillPrerequisite';
import {ISkillInfo} from './interfaces/iSkillInfo';
import {TeamSkill} from './teamSkill';

export class Skill extends bookshelf.Model<Skill> implements ITeamSkillPivot {
  public attributes: ISkillInfo;
  public pivot: TeamSkill;

  public get tableName(): string { return 'skills'; }
  public get idAttribute(): string { return 'id'; }
  public static get nameAttribute(): string { return 'name'; }

  public initialize(): void {
    this.on('saving', (skill: Skill) => this.validateSkill(skill));
  }

  public validateSkill(skill: Skill): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(skill.attributes.name, 1)) {
      return Promise.reject('The skill name must not be empty');
    }

    return Promise.resolve(true);
  }

  public getPrerequisiteSkills(): Collection<Skill> {
    return this.belongsToMany(Skill)
      .through<Skill>(SkillPrerequisite, SkillPrerequisite.skillIdAttribute, SkillPrerequisite.skillPrerequisiteIdAttribute);
  }

  public getContributingSkills(): Collection<Skill> {
    return this.belongsToMany(Skill)
      .through<Skill>(SkillPrerequisite, SkillPrerequisite.skillPrerequisiteIdAttribute, SkillPrerequisite.skillIdAttribute);
  }

  public getTeams(): Promise<ITeamOfASkill[]> {
    return this.belongsToMany(Team)
      .withPivot([TeamSkill.upvotesAttribute])
      .through<Team>(TeamSkill, TeamSkill.skillIdAttribute, TeamSkill.teamIdAttribute)
      .fetch()
      .then((teamsCollection: Collection<Team>) => {
        var teams: Team[] = teamsCollection.toArray();

        return _.map(teams, _team => this._convertTeamToTeamOfASkill(_team));
      });
  }

  private _convertTeamToTeamOfASkill(team: Team): ITeamOfASkill {
    var teamSkill: TeamSkill = <TeamSkill>team.pivot;

    var upvotes: number = teamSkill.attributes.upvotes;

    return {
      team: team,
      upvotes: upvotes
    }
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
