import {Model, Collection, EventFunction, CollectionOptions} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import {TypesValidator} from '../commonUtils/typesValidator';
import {ITeamSkillUpvoteInfo} from './interfaces/iTeamSkillUpvoteInfo';

export class TeamSkillUpvote extends bookshelf.Model<TeamSkillUpvote>{
  public attributes: ITeamSkillUpvoteInfo;

  public get tableName(): string { return 'team_skill_upvotes'; }
  public get idAttribute(): string { return 'id'; }

  public static get teamSkillIdAttribute(): string { return 'team_skill_id' }
  public static get userIdAttribute(): string { return 'user_id' }

  public static collection(upvotes?: TeamSkillUpvote[], options?: CollectionOptions<TeamSkillUpvote>): Collection<TeamSkillUpvote> {
    return new TeamSkillUpvotes(upvotes, options);
  }
}

export class TeamSkillUpvotes extends bookshelf.Collection<TeamSkillUpvote> {
  model = TeamSkillUpvote;

  public static clearAll(): Promise<any> {
    var promises: Promise<TeamSkillUpvote>[] = [];

    return new TeamSkillUpvotes().fetch().then((users: Collection<TeamSkillUpvote>) => {
      users.each(teamSkillUpvotes => {
        var promise: Promise<TeamSkillUpvote> = teamSkillUpvotes.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
