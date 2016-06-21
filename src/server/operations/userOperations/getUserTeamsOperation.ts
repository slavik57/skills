import {ITeamOfAUser} from "../../models/interfaces/iTeamOfAUser";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetUserTeamsOperation extends OperationBase<ITeamOfAUser[]> {

  constructor(private _userId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<ITeamOfAUser[]> {
    return UserDataHandler.getTeams(this._userId);
  }

}
