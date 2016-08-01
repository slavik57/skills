import {GlobalPermission} from "../server/models/enums/globalPermission";
import * as _ from 'lodash';

export class PermissionsGuestFilter {
  public static filter(permissions: GlobalPermission[]): GlobalPermission[] {
    return _.difference(permissions, [GlobalPermission.GUEST]);
  }
}
