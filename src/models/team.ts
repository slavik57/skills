import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {User} from './user';
import {TeamMember} from './teamMember';

export interface ITeamInfo {
  name: string;
}

export class Team extends bookshelf.Model<Team>{
  public attributes: ITeamInfo;

  public get tableName() { return 'teams'; }
  public get idAttribute() { return 'id'; }

  public initialize(): void {
    this.on('saving', (team: Team) => this.validateTeam(team));
  }

  public validateTeam(team: Team): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(team.attributes.name, 1)) {
      return Promise.reject('The team name must not be empty');
    }

    return null;
  }

  public getTeamMembers(): Collection<User> {
    return this.belongsToMany(User).through<User>(TeamMember, 'team_id', 'user_id');
  }
}

export class Teams extends bookshelf.Collection<Team> {
  model = Team;

  public static clearAll(): Promise<any> {
    var promises: Promise<Team>[] = []

    return new Teams().fetch().then((teams: Collection<Team>) => {
      teams.each(team => {
        var promise: Promise<Team> = team.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
