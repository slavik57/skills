import {UserGlobalPermissions} from "../usersGlobalPermissions";
import {Collection} from 'bookshelf';

export interface IUserRelations {
  globalPermissions: Collection<UserGlobalPermissions>;
}
