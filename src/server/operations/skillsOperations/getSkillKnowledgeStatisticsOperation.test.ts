import {User} from "../../models/user";
import {IKnowledgeStatistics} from "../interfaces/iKnowledgeStatistics";
import {GetSkillKnowledgeStatisticsOperation} from "./getSkillKnowledgeStatisticsOperation";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Skill} from "../../models/skill";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {Team} from "../../models/team";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillKnowledgeStatisticsOperation', () => {

  beforeEach(() => {

    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var teams: Team[];
    var team1: Team;
    var team2: Team;
    var team3: Team;
    var skill: Skill;

    var skillKnowingTeams: Team[];

    var operation: GetSkillKnowledgeStatisticsOperation;

    beforeEach(() => {
      var createTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(3)
          .then((_teams: Team[]) => {
            teams = _teams;
            [team1, team2, team3] = _teams;
          });

      var createSkillsPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => EnvironmentDirtifier.createSkills(1, _users[0].id))
          .then((_skills: Skill[]) => {
            [skill] = _skills;
          });

      var createTeamSkillsPromise: Promise<any> =
        Promise.all([createTeamsPromise, createSkillsPromise])
          .then(() => Promise.all([
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team1, skill)),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team2, skill)),
          ]))
          .then(() => {
            skillKnowingTeams = [team1, team2];
          });

      return createTeamSkillsPromise
        .then(() => {
          operation = new GetSkillKnowledgeStatisticsOperation(skill.id);
        });
    });

    function vefifySkillKnowledgeStatistics(actual: IKnowledgeStatistics, expected: IKnowledgeStatistics): void {
      expect(actual.numberOfKnowingTeams,
        'numberOfKnowingTeams should be correct').to.be.equal(expected.numberOfKnowingTeams);

      expect(actual.numberOfNotKnowingTeams,
        'numberOfNotKnowingTeams should be correct').to.be.equal(expected.numberOfNotKnowingTeams);
    }

    it('should return correct result', () => {
      // Arrange
      var expectedStatistices: IKnowledgeStatistics =
        {
          numberOfKnowingTeams: skillKnowingTeams.length,
          numberOfNotKnowingTeams: teams.length - skillKnowingTeams.length
        };

      // Act
      var resultPromise: Promise<any> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualStatistics: IKnowledgeStatistics) => {
          vefifySkillKnowledgeStatistics(_actualStatistics, expectedStatistices);
        });
    });

  });

});
