import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import * as validator from 'validator';
import {TypesValidator} from '../commonUtils/typesValidator';
import {UserGlobalPermissions} from './usersGlobalPermissions';

export interface IUserInfo {
  username: string;
  password_hash: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class User extends bookshelf.Model<User>{
  public attributes: IUserInfo;

  public get tableName() { return 'users'; }
  public get idAttribute() { return 'id'; }

  public initialize(): void {
    this.on('saving', (user: User) => this.validateUser(user));
  }

  public validateUser(user: User): Promise<boolean> {
    if (!validator.isEmail(this.attributes.email)) {
      return Promise.reject('Email is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.username, 1)) {
      return Promise.reject('Username is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.password_hash, 1)) {
      return Promise.reject('Password is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.firstName, 1)) {
      return Promise.reject('First name is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.lastName, 1)) {
      return Promise.reject('Last name is not valid');
    }

    return null;
  }

  public getGlobalPermissions(): Collection<UserGlobalPermissions> {
    return this.hasMany(UserGlobalPermissions, 'user_id');
  }
}

export class Users extends bookshelf.Collection<User> {
  model = User;

  public static clearAll(): Promise<any> {
    var promises: Promise<User>[] = []

    return new Users().fetch().then((users: Collection<User>) => {
      users.each(user => {
        var promise: Promise<User> = user.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
