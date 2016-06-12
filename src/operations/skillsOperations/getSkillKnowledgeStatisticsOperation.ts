import {IKnowledgeStatistics} from "../interfaces/iKnowledgeStatistics";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ITeamOfASkill} from "../../models/interfaces/iTeamOfASkill";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {OperationBase} from "../base/operationBase";

export class GetSkillKnowledgeStatisticsOperation extends OperationBase {

  constructor(private _skillId: number) {
    super();
  }

  protected doWork(): void | Promise<any> {
    var numberOfTeamsPromise: Promise<number> =
      TeamsDataHandler.getNumberOfTeams();

    var skillTeamsPromise: Promise<ITeamOfASkill[]> =
      SkillsDataHandler.getTeams(this._skillId);

    return Promise.all([skillTeamsPromise, numberOfTeamsPromise])
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
