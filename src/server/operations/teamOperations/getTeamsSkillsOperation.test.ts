import {TeamSkill} from "../../models/teamSkill";
import {User} from "../../models/user";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {ISkillsOfATeam} from "../../models/interfaces/iSkillsOfATeam";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import {Skill} from "../../models/skill";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetTeamsSkillsOperation} from './getTeamsSkillsOperation';
import * as _ from 'lodash';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

describe('GetTeamSkillsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var team1: Team;
    var team2: Team;
    var team1Skill1: Skill;
    var team1Skill2: Skill;
    var team2Skill1: Skill;
    var team2Skill2: Skill;
    var team1Skill1TeamSkill: TeamSkill;
    var team1Skill2TeamSkill: TeamSkill;
    var team2Skill1TeamSkill: TeamSkill;
    var team2Skill2TeamSkill: TeamSkill;

    var user1: User;
    var user2: User;
    var user3: User;

    var team1Skill1UpvotingUserIds: number[];
    var team1Skill2UpvotingUserIds: number[];
    var team2Skill1UpvotingUserIds: number[];
    var team2Skill2UpvotingUserIds: number[];

    var operation: GetTeamsSkillsOperation;

    beforeEach(() => {
      var createTeamPromise: bluebirdPromise<any> =
        EnvironmentDirtifier.createTeams(2)
          .then((_teams: Team[]) => {
            [team1, team2] = _teams;
          });

      var createSkillsPromise: bluebirdPromise<any> =
        EnvironmentDirtifier.createSkills(4)
          .then((_skills: Skill[]) => {
            [team1Skill1, team1Skill2, team2Skill1, team2Skill2] = _skills;
          });

      var createUsersPromise: bluebirdPromise<any> =
        EnvironmentDirtifier.createUsers(3)
          .then((_users: User[]) => {
            [user1, user2, user3] = _users;
          });

      return Promise.all([
        createTeamPromise,
        createSkillsPromise,
        createUsersPromise
      ]).then(() => Promise.all([
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team1, team1Skill1)),
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team1, team1Skill2)),
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team2, team2Skill1)),
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team2, team2Skill2))
      ])).then((_teamSkills: TeamSkill[]) => {
        [team1Skill1TeamSkill, team1Skill2TeamSkill, team2Skill1TeamSkill, team2Skill2TeamSkill] = _teamSkills;
      }).then(() => Promise.all([
        TeamsDataHandler.upvoteTeamSkill(team1Skill1TeamSkill.id, user1.id),
        TeamsDataHandler.upvoteTeamSkill(team1Skill1TeamSkill.id, user2.id),
        TeamsDataHandler.upvoteTeamSkill(team1Skill2TeamSkill.id, user1.id),
        TeamsDataHandler.upvoteTeamSkill(team1Skill2TeamSkill.id, user3.id),
        TeamsDataHandler.upvoteTeamSkill(team2Skill1TeamSkill.id, user2.id),
        TeamsDataHandler.upvoteTeamSkill(team2Skill1TeamSkill.id, user3.id)
      ])).then(() => {
        team1Skill1UpvotingUserIds = [user1.id, user2.id];
        team1Skill2UpvotingUserIds = [user1.id, user3.id];
        team2Skill1UpvotingUserIds = [user2.id, user3.id];
        team2Skill2UpvotingUserIds = [];

        operation = new GetTeamsSkillsOperation();
      })
    });

    function verifySkillsOfTeams(actual: ISkillsOfATeam[], expected: ISkillsOfATeam[]): void {
      expect(actual.length, 'The number of teams skills should be correct').to.be.equal(expected.length);

      var actualOrdered: ISkillsOfATeam[] = _.orderBy(actual, _ => _.team.id);
      var expectedOrdered: ISkillsOfATeam[] = _.orderBy(expected, _ => _.team.id);

      for (var i = 0; i < expected.length; i++) {
        var actualTeamSkills: ISkillsOfATeam = actualOrdered[i];
        var expectedTeamSkills: ISkillsOfATeam = expectedOrdered[i];

        expect(actualTeamSkills.team.id, 'Should contain team id: ' + expectedTeamSkills.team.id).to.be.equal(expectedTeamSkills.team.id);

        verifySkillsOfTeam(actualTeamSkills.skills, expectedTeamSkills.skills);
      }
    }

    function verifySkillsOfTeam(actual: ISkillOfATeam[], expected: ISkillOfATeam[]): void {
      expect(actual.length, 'The number of team skills should be correct').to.be.equal(expected.length);

      var actualOrdered: ISkillOfATeam[] = _.orderBy(actual, _ => _.skill.id);
      var expectedOrdered: ISkillOfATeam[] = _.orderBy(expected, _ => _.skill.id);

      for (var i = 0; i < expected.length; i++) {
        var actualTeamSkill: ISkillOfATeam = actualOrdered[i];
        var expectedTeamSkill: ISkillOfATeam = expectedOrdered[i];

        expect(actualTeamSkill.skill.id, 'Should contain skill id: ' + expectedTeamSkill.skill.id).to.be.equal(expectedTeamSkill.skill.id);
        expect(actualTeamSkill.teamSkill.id, 'Should contain teamSkill id: ' + expectedTeamSkill.teamSkill.id).to.be.equal(expectedTeamSkill.teamSkill.id);
        expect(actualTeamSkill.upvotingUserIds.sort(),
          'The upvoting user ids should be correct for skill: ' + expectedTeamSkill.skill.attributes.name).to.deep.equal(expectedTeamSkill.upvotingUserIds.sort());
      }
    }

    it('should return correct result', () => {
      // Act
      var resultPromise: bluebirdPromise<ISkillsOfATeam[]> = operation.execute();

      // Assert
      var expectedTeamsSkills: ISkillsOfATeam[] = [
        {
          team: team1,
          skills: [
            {
              skill: team1Skill1,
              teamSkill: team1Skill1TeamSkill,
              upvotingUserIds: team1Skill1UpvotingUserIds
            },
            {
              skill: team1Skill2,
              teamSkill: team1Skill2TeamSkill,
              upvotingUserIds: team1Skill2UpvotingUserIds
            }
          ]
        },
        {
          team: team2,
          skills: [
            {
              skill: team2Skill1,
              teamSkill: team2Skill1TeamSkill,
              upvotingUserIds: team2Skill1UpvotingUserIds
            },
            {
              skill: team2Skill2,
              teamSkill: team2Skill2TeamSkill,
              upvotingUserIds: team2Skill2UpvotingUserIds
            }
          ]
        }
      ]

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualTeamsSkills: ISkillsOfATeam[]) => {
          verifySkillsOfTeams(_actualTeamsSkills, expectedTeamsSkills);
        });
    });

  });

});
