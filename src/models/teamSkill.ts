import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {ITeamSkillInfo} from './interfaces/iTeamSkillInfo';

export class TeamSkill extends bookshelf.Model<TeamSkill>{
  public attributes: ITeamSkillInfo;

  public get tableName(): string { return 'team_skills'; }
  public get idAttribute(): string { return 'id'; }

  public static get skillIdAttribute(): string { return 'skill_id' }
  public static get teamIdAttribute(): string { return 'team_id' }
  public static get upvotesAttribute(): string { return 'upvotes' }

  public initialize(): void {
    this.on('saving', (teamSkill: TeamSkill) => this.validateTeamSkill(teamSkill));
  }

  public validateTeamSkill(teamSkill: TeamSkill): Promise<boolean> {
    if (!TypesValidator.isInteger(teamSkill.attributes.team_id)) {
      return Promise.reject('The team_id must be an integer');
    }

    if (!TypesValidator.isInteger(teamSkill.attributes.skill_id)) {
      return Promise.reject('The skill_id be an integer');
    }

    return null;
  }
}

export class TeamSkills extends bookshelf.Collection<TeamSkill> {
  model = TeamSkill;

  public static clearAll(): Promise<any> {
    var promises: Promise<TeamSkill>[] = [];

    return new TeamSkills().fetch().then((users: Collection<TeamSkill>) => {
      users.each(teamMembers => {
        var promise: Promise<TeamSkill> = teamMembers.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
