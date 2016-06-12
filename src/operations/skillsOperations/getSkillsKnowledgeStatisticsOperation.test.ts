import {ISkillKnowledgeStatistics} from "../interfaces/iSkillKnowledgeStatistics";
import {GetSkillsKnowledgeStatisticsOperation} from "./getSkillsKnowledgeStatisticsOperation";
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

describe('GetSkillsKnowledgeStatisticsOperation', () => {

  var operation: GetSkillsKnowledgeStatisticsOperation;

  beforeEach(() => {
    operation = new GetSkillsKnowledgeStatisticsOperation();

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
    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    var skill1KnowingTeams: Team[];
    var skill2KnowingTeams: Team[];
    var skill3KnowingTeams: Team[];

    beforeEach(() => {
      var createTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(3)
          .then((_teams: Team[]) => {
            teams = _teams;
            [team1, team2, team3] = _teams;
          });

      var createSkillsPromise: Promise<any> =
        EnvironmentDirtifier.createSkills(3)
          .then((_skills: Skill[]) => {
            [skill1, skill2, skill3] = _skills;
          });

      var createTeamSkillsPromise: Promise<any> =
        Promise.all([createTeamsPromise, createSkillsPromise])
          .then(() => Promise.all([
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team1, skill1)),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team1, skill3)),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team2, skill1)),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team2, skill3)),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team3, skill3))
          ]))
          .then(() => {
            skill1KnowingTeams = [team1, team2];
            skill2KnowingTeams = [];
            skill3KnowingTeams = [team1, team2, team3];
          });

      return createTeamSkillsPromise;
    });

    function vefifySkillKnowledgeStatistics(actual: ISkillKnowledgeStatistics[], expected: ISkillKnowledgeStatistics[]): void {
      expect(actual.length, 'The number of statistics shouls be correct').to.be.equal(expected.length);

      var actualSorted: ISkillKnowledgeStatistics[] = _.orderBy(actual, _ => _.skill.id);
      var expectedSorted: ISkillKnowledgeStatistics[] = _.orderBy(expected, _ => _.skill.id);

      for (var i = 0; i < expected.length; i++) {
        var actualStatistics: ISkillKnowledgeStatistics = actualSorted[i];
        var expectedStatistics: ISkillKnowledgeStatistics = expectedSorted[i];

        var expectedSkillName: string = expectedStatistics.skill.attributes.name;

        expect(actualStatistics.skill.id,
          'Should contain skill: ' + expectedSkillName).to.be.equal(expectedStatistics.skill.id);

        expect(actualStatistics.numberOfKnowingTeams,
          'numberOfKnowingTeams for skill [' + expectedSkillName + '] should be correct').to.be.equal(expectedStatistics.numberOfKnowingTeams);

        expect(actualStatistics.numberOfNotKnowingTeams,
          'numberOfNotKnowingTeams for skill [' + expectedSkillName + '] should be correct').to.be.equal(expectedStatistics.numberOfNotKnowingTeams);
      }
    }

    it('should return correct result', () => {
      // Arrange
      var expectedStatistices: ISkillKnowledgeStatistics[] = [
        {
          skill: skill1,
          numberOfKnowingTeams: skill1KnowingTeams.length,
          numberOfNotKnowingTeams: teams.length - skill1KnowingTeams.length
        },
        {
          skill: skill2,
          numberOfKnowingTeams: skill2KnowingTeams.length,
          numberOfNotKnowingTeams: teams.length - skill2KnowingTeams.length
        },
        {
          skill: skill3,
          numberOfKnowingTeams: skill3KnowingTeams.length,
          numberOfNotKnowingTeams: teams.length - skill3KnowingTeams.length
        }
      ];

      // Act
      var resultPromise: Promise<any> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualStatistics: ISkillKnowledgeStatistics[]) => {
          vefifySkillKnowledgeStatistics(_actualStatistics, expectedStatistices);
        });
    });

  });

});
