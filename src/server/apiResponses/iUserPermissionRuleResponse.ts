import {IUserPermissionResponse} from "./iUserPermissionResponse";

export interface IUserPermissionRuleResponse extends IUserPermissionResponse {
  allowedToChange: boolean;
}
