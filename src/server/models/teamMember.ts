import {ModelBase} from "./modelBase";
import {Model, Collection, EventFunction, CollectionOptions} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../../common/typesValidator';
import {ITeamMemberInfo} from './interfaces/iTeamMemberInfo';

export class TeamMember extends ModelBase<TeamMember, ITeamMemberInfo>{
  public get tableName(): string { return 'team_members'; }

  public static get teamIdAttribute(): string { return 'team_id'; }
  public static get userIdAttribute(): string { return 'user_id'; }
  public static get isAdminAttribute(): string { return 'is_admin'; }

  public static collection(teamMembers?: TeamMember[], options?: CollectionOptions<TeamMember>): Collection<TeamMember> {
    return new TeamMembers(teamMembers, options);
  }

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
    return new TeamMembers().query().del();
  }
}
