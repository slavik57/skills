import {TeamSkill} from "../../models/teamSkill";
import {User} from "../../models/user";
import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
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
import {GetTeamSkillsOperation} from './getTeamSkillsOperation';
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

    var team: Team;
    var teamSkill1: Skill;
    var teamSkill2: Skill;
    var teamSkill3: Skill;

    var user1: User;
    var user2: User;
    var user3: User;

    var teamSkill1UpvotingUserIds: number[];
    var teamSkill2UpvotingUserIds: number[];
    var teamSkill3UpvotingUserIds: number[];

    var operation: GetTeamSkillsOperation;

    beforeEach(() => {
      var createTeamPromise: bluebirdPromise<any> =
        EnvironmentDirtifier.createTeams(1)
          .then((_teams: Team[]) => {
            [team] = _teams;
          });

      var createSkillsPromise: bluebirdPromise<any> =
        EnvironmentDirtifier.createSkills(3)
          .then((_skills: Skill[]) => {
            [teamSkill1, teamSkill2, teamSkill3] = _skills;
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
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team, teamSkill1)),
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team, teamSkill2)),
        TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team, teamSkill3))
      ])).then((_teamSkills: TeamSkill[]) => Promise.all([
        TeamsDataHandler.upvoteTeamSkill(_teamSkills[0].id, user1.id),
        TeamsDataHandler.upvoteTeamSkill(_teamSkills[0].id, user2.id),
        TeamsDataHandler.upvoteTeamSkill(_teamSkills[1].id, user1.id),
        TeamsDataHandler.upvoteTeamSkill(_teamSkills[1].id, user3.id),
        TeamsDataHandler.upvoteTeamSkill(_teamSkills[2].id, user2.id),
        TeamsDataHandler.upvoteTeamSkill(_teamSkills[2].id, user3.id)
      ])).then(() => {
        teamSkill1UpvotingUserIds = [user1.id, user2.id];
        teamSkill2UpvotingUserIds = [user1.id, user3.id];
        teamSkill3UpvotingUserIds = [user2.id, user3.id];

        operation = new GetTeamSkillsOperation(team.id);
      })
    });

    it('should return correct skills', () => {
      // Act
      var resultPromise: bluebirdPromise<ISkillOfATeam[]> = operation.execute();

      // Assert
      var expectedSkills: Skill[] = [teamSkill1, teamSkill2, teamSkill3];

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualTeamSkills: ISkillOfATeam[]) => {
          var actualSkills: Skill[] = _.map(_actualTeamSkills, _ => _.skill);

          ModelVerificator.verifyMultipleModelsEqualById(actualSkills, expectedSkills);
        });
    });

    it('should return correct upvoted users', () => {
      // Act
      var resultPromise: bluebirdPromise<ISkillOfATeam[]> = operation.execute();

      // Assert
      var expected: ISkillOfATeam[] = [
        { skill: teamSkill1, upvotingUserIds: teamSkill1UpvotingUserIds, teamSkill: null },
        { skill: teamSkill2, upvotingUserIds: teamSkill2UpvotingUserIds, teamSkill: null },
        { skill: teamSkill3, upvotingUserIds: teamSkill3UpvotingUserIds, teamSkill: null }
      ]

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualTeamSkills: ISkillOfATeam[]) => {
          var actualTeamSkillsOrdered: ISkillOfATeam[] = _.orderBy(_actualTeamSkills, _ => _.skill.id);
          var expectedTeamSkillsOrdered: ISkillOfATeam[] = _.orderBy(expected, _ => _.skill.id);

          var actualUpvotingUserIds: number[][] = _.map(actualTeamSkillsOrdered, _ => _.upvotingUserIds);
          var expectedUpvotingUserIds: number[][] = _.map(expectedTeamSkillsOrdered, _ => _.upvotingUserIds);

          expect(actualUpvotingUserIds.length).to.be.equal(expectedUpvotingUserIds.length);

          for (var i = 0; i < expectedUpvotingUserIds.length; i++) {
            expect(actualUpvotingUserIds[i].sort()).to.deep.equal(expectedUpvotingUserIds[i].sort());
          }
        });
    });

  });

});
