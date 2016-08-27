import {GetSkillByIdOperation} from "./getSkillByIdOperation";
import {AddSkillPrerequisiteOperation} from "./addSkillPrerequisiteOperation";
import {User} from "../../models/user";
import {GetUserByIdOperation} from "../userOperations/getUserByIdOperation";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {Skill} from "../../models/skill";
import {ISkillModificationPermissionsResponse} from "../../apiResponses/iSkillModificationPermissionsResponse";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillModificationPermissionsOperation extends OperationBase<ISkillModificationPermissionsResponse> {

  constructor(private skillId: number, private executingUserId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<ISkillModificationPermissionsResponse> {
    return this._verifySkillExists()
      .then(() => this._verifyUserExists())
      .then(() => this._getSkillModificationPermissions());
  }

  private _verifySkillExists(): bluebirdPromise<void> {
    var operation = new GetSkillByIdOperation(this.skillId);

    return operation.execute()
      .then((_skill: Skill) => {
        if (_skill) {
          return bluebirdPromise.resolve();
        } else {
          var error = new NotFoundError(`The skill with id ${this.skillId} was not found`);
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

  private _getSkillModificationPermissions(): bluebirdPromise<ISkillModificationPermissionsResponse> {

    return bluebirdPromise.all(
      [
        this._canUserAddPrerequisites()
      ]
    ).then((_permissions: boolean[]) => {
      return <ISkillModificationPermissionsResponse>{
        canModifyPrerequisites: _permissions[0],
        canModifyDependencies: _permissions[0]
      }
    })
  }

  private _canUserAddPrerequisites(): bluebirdPromise<boolean> {
    var operation = new AddSkillPrerequisiteOperation(this.skillId, -1, this.executingUserId);

    return operation.canExecute()
      .then(() => {
        return bluebirdPromise.resolve(true);
      }, () => {
        return bluebirdPromise.resolve(false);
      });
  }

}
