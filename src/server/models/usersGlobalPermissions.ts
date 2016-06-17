import {ModelBase} from "./modelBase";
import {Model, Collection, EventFunction, CollectionOptions} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import {IUserGlobalPermissions} from './interfaces/iUserGlobalPermissions';

export class UserGlobalPermissions extends ModelBase<UserGlobalPermissions, IUserGlobalPermissions>{
  public get tableName(): string { return 'users_global_permissions'; }

  public static get userIdAttribute(): string { return 'user_id'; }

  public static collection(permissions?: UserGlobalPermissions[], options?: CollectionOptions<UserGlobalPermissions>): Collection<UserGlobalPermissions> {
    return new UsersGlobalPermissions(permissions, options);
  }
}

export class UsersGlobalPermissions extends bookshelf.Collection<UserGlobalPermissions> {
  model = UserGlobalPermissions;

  public static clearAll(): Promise<any> {
    return new UsersGlobalPermissions().query().del();
  }
}
