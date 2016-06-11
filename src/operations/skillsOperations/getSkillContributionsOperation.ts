import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillContributionsOperation extends OperationBase {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): void | Promise<any> {
    return SkillsDataHandler.getSkillContributions(this._skillId);
  }

}
