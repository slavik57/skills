import {Team} from "../../models/team";
import {AuthenticatedOperationBase} from "../base/authenticatedOperationBase";
import {GlobalPermission} from "../../models/enums/globalPermission";
import * as bluebirdPromise from 'bluebird';

export class ModifyTeamOperationBase extends AuthenticatedOperationBase<Team> {
  constructor(executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.TEAMS_LIST_ADMIN];
  }
}
