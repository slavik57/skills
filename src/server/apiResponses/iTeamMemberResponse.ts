import {IUserInfoResponse} from "./iUserInfoResponse";

export interface ITeamMemberResponse extends IUserInfoResponse {
  isAdmin: boolean;
}
