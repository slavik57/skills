import {IModelInfo} from "./interfaces/iModelInfo";
import {bookshelf} from '../../../bookshelf';
import {Model} from 'bookshelf';

export class ModelBase<TModel extends Model<any>, TInfo extends IModelInfo> extends bookshelf.Model<TModel> {
  public attributes: TInfo;

  public get idAttribute(): string { return ModelBase.idAttribute; }

  public static get idAttribute(): string { return 'id'; }
}
