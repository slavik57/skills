import {AddRemoveUserFromTeamOperationBase} from "../base/addRemoveUserFromTeamOperationBase";
import {UpdateUserTeamAdminRightsOperation} from "../userOperations/updateUserTeamAdminRightsOperation";
import {UpdateTeamNameOperation} from "./updateTeamNameOperation";
import {User} from "../../models/user";
import {GetUserByIdOperation} from "../userOperations/getUserByIdOperation";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {GetTeamByIdOperation} from "./getTeamByIdOperation";
import {ITeamModificationPermissionsResponse} from "../../apiResponses/iTeamModificationPermissionsResponse";
import {Team} from "../../models/team";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetTeamModificationPermissionsOperation extends OperationBase<ITeamModificationPermissionsResponse> {

  constructor(private teamId: number, private executingUserId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<ITeamModificationPermissionsResponse> {
    return this._verifyTeamExists()
      .then(() => this._verifyUserExists())
      .then(() => this._getTeamModificationPermissions());
  }

  private _verifyTeamExists(): bluebirdPromise<void> {
    var operation = new GetTeamByIdOperation(this.teamId);

    return operation.execute()
      .then((_team: Team) => {
        if (_team) {
          return bluebirdPromise.resolve();
        } else {
          var error = new NotFoundError(`The team with id ${this.teamId} was not found`);
          return bluebirdPromise.reject(error);
        }
      });
  }

  private _verifyUserExists(): bluebirdPromise<void> {
    var operation = new GetUserByIdOperation(this.executingUserId);

    return operation.execute()
      .then((_user: User) => {
        if (_user) {
          return bluebirdPromise.resolve();
        } else {
          var error = new NotFoundError(`The user with id ${this.executingUserId} was not found`);
          return bluebirdPromise.reject(error);
        }
      });
  }

  private _getTeamModificationPermissions(): bluebirdPromise<ITeamModificationPermissionsResponse> {

    return bluebirdPromise.all(
      [
        this._canUserModifyTeamName(),
        this._canUserModifyTeamAdmins(),
        this._canUserModifyTeamUsers(),
      ]
    ).then((_permissions: boolean[]) => {
      return <ITeamModificationPermissionsResponse>{
        canModifyTeamName: _permissions[0],
        canModifyTeamAdmins: _permissions[1],
        canModifyTeamUsers: _permissions[2]
      }
    })
  }

  private _canUserModifyTeamName(): bluebirdPromise<boolean> {
    var updateTeamNameOperation =
      new UpdateTeamNameOperation(this.teamId, '', this.executingUserId);

    return updateTeamNameOperation.canExecute()
      .then(() => {
        return bluebirdPromise.resolve(true);
      }, () => {
        return bluebirdPromise.resolve(false);
      });
  }

  private _canUserModifyTeamAdmins(): bluebirdPromise<boolean> {
    return UpdateUserTeamAdminRightsOperation.canUpdateUserRights(this.teamId, this.executingUserId)
      .then(() => {
        return bluebirdPromise.resolve(true);
      }, () => {
        return bluebirdPromise.resolve(false);
      });
  }

  private _canUserModifyTeamUsers(): bluebirdPromise<boolean> {
    var addRemoveUserFromTeamOperationBase =
      new AddRemoveUserFromTeamOperationBase<void>(this.teamId, this.executingUserId);

    return addRemoveUserFromTeamOperationBase.canExecute()
      .then(() => {
        return bluebirdPromise.resolve(true);
      }, () => {
        return bluebirdPromise.resolve(false);
      });
  }

}
