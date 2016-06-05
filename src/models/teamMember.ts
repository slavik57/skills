import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';

export interface ITeamMemberInfo {
  team_id: number;
  user_id: number;
  is_admin?: boolean;
}

export class TeamMember extends bookshelf.Model<TeamMember>{
  public attributes: ITeamMemberInfo;

  public get tableName() { return 'team_members'; }
  public get idAttribute() { return 'id'; }

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

    return null;
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
