import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillContributionsOperation extends OperationBase<Skill[]> {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): Promise<Skill[]> {
    return SkillsDataHandler.getSkillContributions(this._skillId);
  }

}
