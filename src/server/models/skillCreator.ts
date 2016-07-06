import {TypesValidator} from "../../common/typesValidator";
import {ISkillCreatorInfo} from "./interfaces/iSkillCreatorInfo";
import {ModelBase} from "./modelBase";
import {bookshelf} from '../../../bookshelf';
import {Collection, CollectionOptions} from 'bookshelf';
import * as bluebirdPromise from 'bluebird';

export class SkillCreator extends ModelBase<SkillCreator, ISkillCreatorInfo>{
  public get tableName(): string { return 'skill_creator'; }

  public static get skillIdAttribute(): string { return 'skill_id'; }
  public static get userIdAttribute(): string { return 'user_id'; }

  public static collection(skillsCreators?: SkillCreator[], options?: CollectionOptions<SkillCreator>): Collection<SkillCreator> {
    return new SkillCreators(skillsCreators, options);
  }

  public initialize(): void {
    this.on('saving', (_skillsCreator: SkillCreator) => this._validateSkillCreator(_skillsCreator));
  }

  private _validateSkillCreator(skillCreator: SkillCreator): bluebirdPromise<boolean> {
    if (!TypesValidator.isInteger(skillCreator.attributes.skill_id)) {
      return bluebirdPromise.reject(this._createError('The skill_id must be an integer'));
    }

    if (!TypesValidator.isInteger(skillCreator.attributes.user_id)) {
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

export class SkillCreators extends bookshelf.Collection<SkillCreator> {
  model = SkillCreator;

  public static clearAll(): Promise<any> {
    return new SkillCreators().query().del();
  }
}
