import {IPrerequisitesOfASkill} from "./interfaces/iPrerequisitesOfASkill";
import {ISkillRelations} from "./interfaces/iSkillRelations";
import {ITeamsOfASkill} from "./interfaces/iTeamsOfASkill";
import {ModelBase} from "./modelBase";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {Team} from "./team";
import {ITeamOfASkill} from "./interfaces/iTeamOfASkill";
import {Model, Collection, EventFunction, CollectionOptions, CollectionFetchOptions} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {TypesValidator} from '../../common/typesValidator';
import {SkillPrerequisite} from './skillPrerequisite';
import {ISkillInfo} from './interfaces/iSkillInfo';
import {TeamSkill} from './teamSkill';

export class Skill extends ModelBase<Skill, ISkillInfo> {
  public get tableName(): string { return 'skills'; }
  public static get dependents(): string[] {
    return [
      Skill.relatedSkillPrerequisitesAttribute,
      Skill.relatedSkillContributorsAttribute,
      Skill.relatedTeamSkillsAttribute
    ];
  }

  public relations: ISkillRelations;

  public static get nameAttribute(): string { return 'name'; }
  public static get relatedSkillPrerequisitesAttribute(): string { return 'skillPrerequisites'; }
  public static get relatedSkillContributorsAttribute(): string { return 'skillContributors'; }
  public static get relatedTeamSkillsAttribute(): string { return 'teamSkills'; }

  public static collection(skills?: Skill[], options?: CollectionOptions<Skill>): Collection<Skill> {
    return new Skills(skills, options);
  }

  public initialize(): void {
    this.on('saving', (skill: Skill) => this._validateSkill(skill));
  }

  public skillPrerequisites(): Collection<SkillPrerequisite> {
    return this.hasMany(SkillPrerequisite, SkillPrerequisite.skillIdAttribute);
  }

  public skillContributors(): Collection<SkillPrerequisite> {
    return this.hasMany(SkillPrerequisite, SkillPrerequisite.skillPrerequisiteIdAttribute);
  }

  public teamSkills(): Collection<TeamSkill> {
    return this.hasMany(TeamSkill, TeamSkill.skillIdAttribute);
  }

  public prerequisiteSkills(): Collection<Skill> {
    return this.belongsToMany(Skill)
      .through<Skill>(SkillPrerequisite, SkillPrerequisite.skillIdAttribute, SkillPrerequisite.skillPrerequisiteIdAttribute);
  }

  public contributingSkills(): Collection<Skill> {
    return this.belongsToMany(Skill)
      .through<Skill>(SkillPrerequisite, SkillPrerequisite.skillPrerequisiteIdAttribute, SkillPrerequisite.skillIdAttribute);
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

  private _validateSkill(skill: Skill): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(skill.attributes.name, 1)) {
      return Promise.reject('The skill name must not be empty');
    }

    return Promise.resolve(true);
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
    return new Skills().query().del();
  }

  public static getTeamsOfSkills(): Promise<ITeamsOfASkill[]> {
    var fetchOptions: CollectionFetchOptions = {
      withRelated: [
        Skill.relatedTeamSkillsAttribute
      ]
    };

    return new Skills()
      .fetch(fetchOptions)
      .then((_skillsCollection: Collection<Skill>) => {
        return _skillsCollection.toArray();
      })
      .then((_skills: Skill[]) => {
        return _.map(_skills, _skill => this._convertToTeamsOfASkill(_skill))
      });
  }

  public static getSkillsToPrerequisitesMap(): Promise<IPrerequisitesOfASkill[]> {
    var fetchOptions: CollectionFetchOptions = {
      withRelated: [
        Skill.relatedSkillPrerequisitesAttribute
      ]
    };

    return new Skills()
      .fetch(fetchOptions)
      .then((_skillsCollection: Collection<Skill>) => {
        return _skillsCollection.toArray();
      })
      .then((_skills: Skill[]) => {
        return _.map(_skills, _skill => this._convertToPrerequisitesOfASkill(_skill))
      });
  }

  private static _convertToTeamsOfASkill(skill: Skill): ITeamsOfASkill {
    var teamSkills: TeamSkill[] = skill.relations.teamSkills.toArray();

    return {
      skill: skill,
      teamsIds: _.map(teamSkills, _ => _.attributes.team_id)
    }
  }

  private static _convertToPrerequisitesOfASkill(skill: Skill): IPrerequisitesOfASkill {
    var skillPrerequisites: SkillPrerequisite[] = skill.relations.skillPrerequisites.toArray();

    return {
      skill: skill,
      prerequisiteSkillIds: _.map(skillPrerequisites, _ => _.attributes.skill_prerequisite_id)
    }
  }
}
