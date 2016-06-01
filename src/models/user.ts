import {Model, Collection} from 'bookshelf';
import {bookshelf} from '../../bookshelf';

export interface IUser {
  username: string;
  password_hash: string;
  email: string;
  firstName: string;
  lastName: string;
}
export class User extends bookshelf.Model<User>{
  public attributes: IUser;

  public get tableName() { return 'users'; }
  public get idAttribute() { return 'id'; }
}


export class Users extends bookshelf.Collection<User> {
  model = User;
}
