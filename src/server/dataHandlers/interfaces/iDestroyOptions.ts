import {DestroyOptions} from 'bookshelf';

export interface IDestroyOptions extends DestroyOptions {
  cascadeDelete?: boolean;
}
