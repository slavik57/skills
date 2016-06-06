import {Skill} from "./skill";
import {ITeamSkillRelations} from "./interfaces/iTeamSkillRelations";
import {Team} from "./team";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {ITeamSkillInfo} from './interfaces/iTeamSkillInfo';

export class TeamSkill extends bookshelf.Model<TeamSkill>{
  public attributes: ITeamSkillInfo;
  public relations: ITeamSkillRelations;

  public get tableName(): string { return 'team_skills'; }
  public get idAttribute(): string { return 'id'; }

  public static get skillIdAttribute(): string { return 'skill_id' }
  public static get teamIdAttribute(): string { return 'team_id' }
  public static get relatedTeamSkillUpvotesAttribute(): string { return 'upvotes'; }
  public static get relatedTeamAttribute(): string { return 'team'; }
  public static get relatedSkillAttribute(): string { return 'skill'; }

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
    var promises: Promise<TeamSkill>[] = [];

    return new TeamSkills().fetch().then((users: Collection<TeamSkill>) => {
      users.each(teamSkills => {
        var promise: Promise<TeamSkill> = teamSkills.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}