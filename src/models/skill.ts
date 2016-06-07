import {ModelBase} from "./modelBase";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {Team} from "./team";
import {ITeamOfASkill} from "./interfaces/iTeamOfASkill";
import {Model, Collection, EventFunction, CollectionFetchOptions} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {TypesValidator} from '../commonUtils/typesValidator';
import {SkillPrerequisite} from './skillPrerequisite';
import {ISkillInfo} from './interfaces/iSkillInfo';
import {TeamSkill} from './teamSkill';

export class Skill extends ModelBase<Skill, ISkillInfo> {
  public get tableName(): string { return 'skills'; }

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

  public prerequisiteSkills(): Collection<Skill> {
    return this.belongsToMany(Skill)
      .through<Skill>(SkillPrerequisite, SkillPrerequisite.skillIdAttribute, SkillPrerequisite.skillPrerequisiteIdAttribute);
  }

  public contributingSkills(): Collection<Skill> {
    return this.belongsToMany(Skill)
      .through<Skill>(SkillPrerequisite, SkillPrerequisite.skillPrerequisiteIdAttribute, SkillPrerequisite.skillIdAttribute);
  }

  public teamSkills(): Collection<TeamSkill> {
    return this.hasMany(TeamSkill, TeamSkill.skillIdAttribute);
  }

  public getTeams(): Promise<ITeamOfASkill[]> {
    var fetchOptions: CollectionFetchOptions = {
      withRelated: [
        TeamSkill.relatedTeamSkillUpvotesAttribute,
        TeamSkill.relatedTeamAttribute
      ]
    };

    return this.teamSkills()
      .fetch(fetchOptions)
      .then((teamSkillsCollection: Collection<TeamSkill>) => {
        var teamSkills: TeamSkill[] = teamSkillsCollection.toArray();

        return _.map(teamSkills, _skill => this._convertTeamSkillToTeamOfASkill(_skill));
      });
  }

  private _teams(): Collection<Team> {
    return this.belongsToMany(Team)
      .through<Team>(TeamSkill, TeamSkill.skillIdAttribute, TeamSkill.teamIdAttribute)
  }

  private _convertTeamSkillToTeamOfASkill(teamSkill: TeamSkill): ITeamOfASkill {
    var team: Team = teamSkill.relations.team;

    var upvotesCollection: Collection<TeamSkillUpvote> = teamSkill.relations.upvotes;
    var upvotes: TeamSkillUpvote[] = upvotesCollection.toArray();

    var upvotingIds =
      _.map(upvotes, _ => _.attributes.user_id);

    return {
      team: team,
      upvotingUserIds: upvotingIds
    };
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
