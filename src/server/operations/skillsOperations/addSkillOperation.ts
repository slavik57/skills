import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../../models/interfaces/iSkillInfo";
import {SkillOperationBase} from "../base/skillOperationBase";
import * as bluebirdPromise from 'bluebird';

export class AddSkillOperation extends SkillOperationBase<Skill> {

  constructor(executingUserId: number, private _skillInfo: ISkillInfo) {
    super(executingUserId);
  }

  public canExecute(): bluebirdPromise<any> {
    return super.canExecute()
      .then(() => this._checkIfSkillAlreadyExists(),
      (_error: any) => bluebirdPromise.reject(_error));
  }

  protected doWork(): bluebirdPromise<Skill> {
    return SkillsDataHandler.createSkill(this._skillInfo, this.executingUserId);
  }

  private _checkIfSkillAlreadyExists(): bluebirdPromise<void> {
    return SkillsDataHandler.getSkillByName(this._skillInfo.name)
      .then((_skill: Skill) => {
        if (!_skill) {
          return bluebirdPromise.resolve();
        }

        var error = new AlreadyExistsError();
        error.message = 'Skill with the name ' + this._skillInfo.name + ' already exists';
        return bluebirdPromise.reject(error);
      }, () => {
        return bluebirdPromise.resolve();
      });
  }
}
