import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {ITeamMemberInfo} from './interfaces/iTeamMemberInfo';

export class TeamMember extends bookshelf.Model<TeamMember>{
  public attributes: ITeamMemberInfo;

  public get tableName(): string { return 'team_members'; }
  public get idAttribute(): string { return 'id'; }

  public static get teamIdAttribute(): string { return 'team_id'; }
  public static get userIdAttribute(): string { return 'user_id'; }
  public static get isAdminAttribute(): string { return 'is_admin'; }

  public initialize(): void {
    this.on('saving', (teamMember: TeamMember) => this.validateTeamMember(teamMember));
  }

  public validateTeamMember(teamMember: TeamMember): Promise<boolean> {
    if (!TypesValidator.isInteger(teamMember.attributes.team_id)) {
      return Promise.reject('The team_id must be an integer');
    }

    if (!TypesValidator.isInteger(teamMember.attributes.user_id)) {
      return Promise.reject('The user_id be an integer');
    }

    return Promise.resolve(true);
  }
}

export class TeamMembers extends bookshelf.Collection<TeamMember> {
  model = TeamMember;

  public static clearAll(): Promise<any> {
    var promises: Promise<TeamMember>[] = [];

    return new TeamMembers().fetch().then((users: Collection<TeamMember>) => {
      users.each(teamMembers => {
        var promise: Promise<TeamMember> = teamMembers.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
