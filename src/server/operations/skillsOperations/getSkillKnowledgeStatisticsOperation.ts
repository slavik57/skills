import {IKnowledgeStatistics} from "../interfaces/iKnowledgeStatistics";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ITeamOfASkill} from "../../models/interfaces/iTeamOfASkill";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";
import * as bluebirdPromise from 'bluebird';

export class GetSkillKnowledgeStatisticsOperation extends OperationBase<IKnowledgeStatistics> {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): bluebirdPromise<IKnowledgeStatistics> {
    var numberOfTeamsPromise: bluebirdPromise<number> =
      TeamsDataHandler.getNumberOfTeams();

    var skillTeamsPromise: bluebirdPromise<ITeamOfASkill[]> =
      SkillsDataHandler.getTeams(this._skillId);

    return bluebirdPromise.all([skillTeamsPromise, numberOfTeamsPromise])
      .then((result: any[]) => {
        return this._calculateSkillsKnowledgeStatistics(result[0], result[1]);
      });
  }

  private _calculateSkillsKnowledgeStatistics(skillTeams: ITeamOfASkill[], numberOfTeams: number): IKnowledgeStatistics {
    var numberOfKnowingTeams: number = skillTeams.length;

    return {
      numberOfKnowingTeams: numberOfKnowingTeams,
      numberOfNotKnowingTeams: numberOfTeams - numberOfKnowingTeams
    };
  }

}
