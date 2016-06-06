import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import {IUserGlobalPermissions} from './interfaces/iUserGlobalPermissions';

export class UserGlobalPermissions extends bookshelf.Model<UserGlobalPermissions>{
  public attributes: IUserGlobalPermissions;

  public get tableName(): string { return 'users_global_permissions'; }
  public get idAttribute(): string { return 'id'; }

  public static get userIdAttribute(): string { return 'user_id'; }
}

export class UsersGlobalPermissions extends bookshelf.Collection<UserGlobalPermissions> {
  model = UserGlobalPermissions;

  public static clearAll(): Promise<any> {
    var promises: Promise<UserGlobalPermissions>[] = [];

    return new UsersGlobalPermissions().fetch().then((users: Collection<UserGlobalPermissions>) => {
      users.each(user => {
        var promise: Promise<UserGlobalPermissions> = user.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
