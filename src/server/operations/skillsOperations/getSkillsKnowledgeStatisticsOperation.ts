import {ISkillKnowledgeStatistics} from "../interfaces/iSkillKnowledgeStatistics";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ITeamsOfASkill} from "../../models/interfaces/iTeamsOfASkill";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillsKnowledgeStatisticsOperation extends OperationBase<ISkillKnowledgeStatistics[]> {

  constructor() {
    super();
  }

  protected doWork(): bluebirdPromise<ISkillKnowledgeStatistics[]> {
    var numberOfTeamsPromise: bluebirdPromise<number> =
      TeamsDataHandler.getNumberOfTeams();

    var teamsOfSkillsPromise: bluebirdPromise<ITeamsOfASkill[]> =
      SkillsDataHandler.getTeamsOfSkills();

    return bluebirdPromise.all([teamsOfSkillsPromise, numberOfTeamsPromise])
      .then((result: any[]) => {
        return this._calculateSkillsKnowledgeStatistics(result[0], result[1]);
      });
  }

  private _calculateSkillsKnowledgeStatistics(teamsOfSkills: ITeamsOfASkill[], numberOfTeams: number): ISkillKnowledgeStatistics[] {
    var result: ISkillKnowledgeStatistics[] = [];

    teamsOfSkills.forEach((_teamsOfSkill: ITeamsOfASkill) => {
      var numberOfnowingTeams: number = _teamsOfSkill.teamsIds.length;

      result.push({
        skill: _teamsOfSkill.skill,
        numberOfKnowingTeams: numberOfnowingTeams,
        numberOfNotKnowingTeams: numberOfTeams - numberOfnowingTeams
      });
    });

    return result;
  }

}
