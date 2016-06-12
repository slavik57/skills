import {ISkillKnowledgeStatistics} from "../interfaces/iSkillKnowledgeStatistics";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ITeamsOfASkill} from "../../models/interfaces/iTeamsOfASkill";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillsKnowledgeStatisticsOperation extends OperationBase {

  constructor() {
    super();
  }

  protected doWork(): void | Promise<any> {
    var numberOfTeamsPromise: Promise<number> =
      TeamsDataHandler.getNumberOfTeams();

    var teamsOfSkillsPromise: Promise<ITeamsOfASkill[]> =
      SkillsDataHandler.getTeamsOfSkills();

    return Promise.all([teamsOfSkillsPromise, numberOfTeamsPromise])
      .then((result: any[]) => {
        return this._calculateSkillsKnowledgeStatistics(result[0], result[1]);
      });
  }

  private _calculateSkillsKnowledgeStatistics(teamsOfSkills: ITeamsOfASkill[], numberOfTeams: number): ISkillKnowledgeStatistics[] {
    var result: ISkillKnowledgeStatistics[] = [];

    teamsOfSkills.forEach((_teamsOfSkill: ITeamsOfASkill) => {
      var numberOKnowingTeams: number = _teamsOfSkill.teamsIds.length;

      result.push({
        skill: _teamsOfSkill.skill,
        numberOfKnowingTeams: numberOKnowingTeams,
        numberOfNotKnowingTeams: numberOfTeams - numberOKnowingTeams
      });
    });

    return result;
  }

}
