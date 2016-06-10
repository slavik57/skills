import {GlobalPermission} from "../../models/enums/globalPermission";
import {AuthenticatedOperationBase} from "./authenticatedOperationBase";

export class SkillOperationBase extends AuthenticatedOperationBase {

  constructor(executingUserId: number) {
    super(executingUserId);
  }

  protected get sufficientOperationGlobalPermissions(): GlobalPermission[] {
    return [GlobalPermission.SKILLS_LIST_ADMIN];
  }

}
