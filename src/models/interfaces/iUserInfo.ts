import {IModelInfo} from "./iModelInfo";

export interface IUserInfo extends IModelInfo {
  username: string;
  password_hash: string;
  email: string;
  firstName: string;
  lastName: string;
}
