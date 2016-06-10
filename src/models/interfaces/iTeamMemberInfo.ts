import {IModelInfo} from "./iModelInfo";

export interface ITeamMemberInfo extends IModelInfo {
  team_id: number;
  user_id: number;
  is_admin?: boolean;
}
