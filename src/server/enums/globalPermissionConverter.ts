import {IUserPermissionResponse} from "../apiResponses/iUserPermissionResponse";
import {GlobalPermission} from "../models/enums/globalPermission";

export class GlobalPermissionConverter {
  public static convertToUserPermissionResponse(permission: GlobalPermission): IUserPermissionResponse {

    var name: string = this._getName(permission);
    var description: string = this._getDescription(permission);

    return {
      value: permission,
      name: name,
      descrition: description
    }
  }

  private static _getName(permission: GlobalPermission): string {
    switch (permission) {
      case GlobalPermission.ADMIN:
        return 'Admin';
      case GlobalPermission.TEAMS_LIST_ADMIN:
        return 'Teams list admin';
      case GlobalPermission.SKILLS_LIST_ADMIN:
        return 'Skills list admin';
      case GlobalPermission.READER:
        return 'Reader';
      case GlobalPermission.GUEST:
        return 'Guest';
      default:
        return 'Unknown permission';
    }
  }

  private static _getDescription(permission: GlobalPermission): string {
    switch (permission) {
      case GlobalPermission.ADMIN:
        return 'Can do anything';
      case GlobalPermission.TEAMS_LIST_ADMIN:
        return 'Can create/destroy teams';
      case GlobalPermission.SKILLS_LIST_ADMIN:
        return 'Can create/destroy skills';
      case GlobalPermission.READER:
        return 'Registered user';
      case GlobalPermission.GUEST:
        return 'Unregistered user';
      default:
        return 'Unknown permission';
    }
  }
}
