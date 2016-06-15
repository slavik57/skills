import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamOperationBase} from "./teamOperationBase";

export class AddRemoveUserFromTeamOperationBase<T> extends TeamOperationBase<T> {

  constructor(_teamId: number,
    _executingUserId: number) {

    super(_teamId, _executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }

}
