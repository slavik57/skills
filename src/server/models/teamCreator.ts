import {TypesValidator} from "../../common/typesValidator";
import {ITeamCreatorInfo} from "./interfaces/iTeamCreatorInfo";
import {ModelBase} from "./modelBase";
import {bookshelf} from '../../../bookshelf';
import {Collection, CollectionOptions} from 'bookshelf';
import * as bluebirdPromise from 'bluebird';

export class TeamCreator extends ModelBase<TeamCreator, ITeamCreatorInfo>{
  public get tableName(): string { return 'team_creator'; }

  public static get teamIdAttribute(): string { return 'team_id'; }
  public static get userIdAttribute(): string { return 'user_id'; }

  public static collection(teamsCreators?: TeamCreator[], options?: CollectionOptions<TeamCreator>): Collection<TeamCreator> {
    return new TeamCreators(teamsCreators, options);
  }

  public initialize(): void {
    this.on('saving', (_teamsCreator: TeamCreator) => this._validateTeamCreator(_teamsCreator));
  }

  private _validateTeamCreator(teamCreator: TeamCreator): bluebirdPromise<boolean> {
    if (!TypesValidator.isInteger(teamCreator.attributes.team_id)) {
      return bluebirdPromise.reject(this._createError('The team_id must be an integer'));
    }

    if (!TypesValidator.isInteger(teamCreator.attributes.user_id)) {
      return bluebirdPromise.reject(this._createError('The user_id be an integer'));
    }

    return bluebirdPromise.resolve(true);
  }

  private _createError(errorMessage: string): Error {
    var error = new Error();
    error.message = errorMessage;
    return error;
  }
}

export class TeamCreators extends bookshelf.Collection<TeamCreator> {
  model = TeamCreator;

  public static clearAll(): Promise<any> {
    return new TeamCreators().query().del();
  }
}
