import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';

export enum GlobalPermission {
  'ADMIN',
  'TEAMS_LIST_ADMIN',
  'SKILLS_LIST_ADMIN',
  'READER',
  'GUEST'
}

export interface IUserGlobalPermissions {
  username: string;
  global_permissions: string
}

export class UserGlobalPermissions extends bookshelf.Model<UserGlobalPermissions>{
  public attributes: IUserGlobalPermissions;

  public get tableName() { return 'users_global_permissions'; }
  public get idAttribute() { return 'id'; }
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
