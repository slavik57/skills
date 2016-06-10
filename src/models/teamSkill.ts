import {ModelBase} from "./modelBase";
import {Skill} from "./skill";
import {ITeamSkillRelations} from "./interfaces/iTeamSkillRelations";
import {Team} from "./team";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {Model, Collection, EventFunction, CollectionOptions} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {ITeamSkillInfo} from './interfaces/iTeamSkillInfo';

export class TeamSkill extends ModelBase<TeamSkill, ITeamSkillInfo>{
  public get tableName(): string { return 'team_skills'; }
  public static get dependents(): string[] {
    return [
      TeamSkill.relatedTeamSkillUpvotesAttribute
    ];
  }

  public relations: ITeamSkillRelations;

  public static get skillIdAttribute(): string { return 'skill_id' }
  public static get teamIdAttribute(): string { return 'team_id' }
  public static get relatedTeamSkillUpvotesAttribute(): string { return 'upvotes'; }
  public static get relatedTeamAttribute(): string { return 'team'; }
  public static get relatedSkillAttribute(): string { return 'skill'; }

  public static collection(teamSkills?: TeamSkill[], options?: CollectionOptions<TeamSkill>): Collection<TeamSkill> {
    return new TeamSkills(teamSkills, options);
  }

  public initialize(): void {
    this.on('saving', (teamSkill: TeamSkill) => this._validateTeamSkill(teamSkill));
  }

  public upvotes(): Collection<TeamSkillUpvote> {
    return this.hasMany(TeamSkillUpvote, TeamSkillUpvote.teamSkillIdAttribute);
  }

  public team(): Team {
    return this.belongsTo(Team, TeamSkill.teamIdAttribute);
  }

  public skill(): Skill {
    return this.belongsTo(Skill, TeamSkill.skillIdAttribute);
  }

  private _validateTeamSkill(teamSkill: TeamSkill): Promise<boolean> {
    if (!TypesValidator.isInteger(teamSkill.attributes.team_id)) {
      return Promise.reject('The team_id must be an integer');
    }

    if (!TypesValidator.isInteger(teamSkill.attributes.skill_id)) {
      return Promise.reject('The skill_id be an integer');
    }

    return Promise.resolve(true);
  }
}

export class TeamSkills extends bookshelf.Collection<TeamSkill> {
  model = TeamSkill;

  public static clearAll(): Promise<any> {
    return new TeamSkills().query().del();
  }
}
