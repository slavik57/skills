import {ISkillsOfATeam} from "../models/interfaces/iSkillsOfATeam";
import {TeamSkillUpvote} from "../models/teamSkillUpvote";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {ITestModels} from "../testUtils/interfaces/iTestModels";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoComparers} from "../testUtils/modelInfoComparers";
import {ModelVerificator} from "../testUtils/modelVerificator";
import {TeamSkillUpvotes} from "../models/teamSkillUpvote";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {SkillsDataHandler} from "./skillsDataHandler";
import {Skill, Skills} from "../models/skill";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised';
import {Team, Teams} from '../models/team';
import {TeamMember, TeamMembers} from '../models/teamMember';
import {User, Users} from '../models/user';
import {TeamsDataHandler} from './teamsDataHandler';
import {UserDataHandler} from './userDataHandler';
import {IUserOfATeam} from '../models/interfaces/iUserOfATeam';
import {ISkillOfATeam} from '../models/interfaces/iSkillOfATeam';
import {TeamSkill, TeamSkills} from '../models/teamSkill';

chai.use(chaiAsPromised);

describe('TeamsDataHandler', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('createTeam', () => {

    it('should create a team correctly', () => {
      // Act
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var teamPromise: Promise<Team> =
        TeamsDataHandler.createTeam(teamInfo);

      // Assert
      return ModelVerificator.verifyModelInfoAsync(teamPromise, teamInfo);
    });

  });

  describe('deleteTeam', () => {

    var testModels: ITestModels;

    beforeEach(() => {
      return EnvironmentDirtifier.fillAllTables()
        .then((_testModels: ITestModels) => {
          testModels = _testModels;
        })
    })

    it('not existing team should not fail', () => {
      // Act
      var promise: Promise<Team> =
        TeamsDataHandler.deleteTeam(9999);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing team should not fail', () => {
      // Arrange
      var teamToDelete: Team = testModels.teams[0];

      // Act
      var promise: Promise<Team> =
        TeamsDataHandler.deleteTeam(teamToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing team should remove the team', () => {
      // Arrange
      var teamToDelete: Team = testModels.teams[0];

      // Act
      var promise: Promise<Team> =
        TeamsDataHandler.deleteTeam(teamToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeam(teamToDelete.id))
        .then((team: Team) => {
          expect(team).to.be.null;
        })
    });

    it('existing team should remove the relevant team skills', () => {
      // Arrange
      var teamToDelete: Team = testModels.teams[0];

      // Act
      var promise: Promise<Team> =
        TeamsDataHandler.deleteTeam(teamToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkills().fetch())
        .then((_teamSkillsCollection: Collection<TeamSkill>) => _teamSkillsCollection.toArray())
        .then((_teamSkills: TeamSkill[]) => {
          return _.map(_teamSkills, _ => _.attributes.team_id);
        })
        .then((_skillIds: number[]) => {
          expect(_skillIds).not.to.contain(teamToDelete.id);
        });
    });

    it('existing team should remove the relevant team members', () => {
      // Arrange
      var teamToDelete: Team = testModels.teams[0];

      // Act
      var promise: Promise<Team> =
        TeamsDataHandler.deleteTeam(teamToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamMembers().fetch())
        .then((_teamMembersCollection: Collection<TeamMember>) => _teamMembersCollection.toArray())
        .then((_teamMembers: TeamMember[]) => {
          return _.map(_teamMembers, _ => _.attributes.team_id);
        })
        .then((_skillIds: number[]) => {
          expect(_skillIds).not.to.contain(teamToDelete.id);
        });
    });

    it('existing team should remove the relevant team skill upvotes', () => {
      // Arrange
      var teamToDelete: Team = testModels.teams[0];

      // Act
      var promise: Promise<Team> =
        TeamsDataHandler.deleteTeam(teamToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkillUpvotes().fetch())
        .then((_teamSkillUpvotesCollection: Collection<TeamSkillUpvote>) => _teamSkillUpvotesCollection.toArray())
        .then((_teamSkillsUpvotes: TeamSkillUpvote[]) => {
          return _.map(_teamSkillsUpvotes, _ => _.attributes.team_skill_id);
        })
        .then((_teamSkillIds: number[]) => {
          return _.filter(testModels.teamSkills, _ => _teamSkillIds.indexOf(_.id) >= 0);
        })
        .then((_teamSkills: TeamSkill[]) => {
          return _.map(_teamSkills, _ => _.attributes.team_id);
        })
        .then((_teamIds: number[]) => {
          expect(_teamIds).not.to.contain(teamToDelete.id);
        });
    });

  });

  describe('getTeam', () => {

    it('no such team should return null', () => {
      // Act
      var teamPromise: Promise<Team> =
        TeamsDataHandler.getTeam(9999999);

      // Assert
      return expect(teamPromise).to.eventually.null;
    });

    it('team exists should return correct team', () => {
      // Arrange
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var createTeamPromose: Promise<Team> =
        TeamsDataHandler.createTeam(teamInfo);

      // Act
      var getTeamPromise: Promise<Team> =
        createTeamPromose.then((team: Team) => TeamsDataHandler.getTeam(team.id));

      // Assert
      return ModelVerificator.verifyModelInfoAsync(getTeamPromise, teamInfo);
    });

  });

  describe('getTeams', () => {

    it('no teams should return empty', () => {
      // Act
      var teamsPromise: Promise<Team[]> =
        TeamsDataHandler.getTeams();

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('teams exist should return correct teams', () => {
      // Arrange
      var teamInfo1: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var teamInfo2: ITeamInfo = ModelInfoMockFactory.createTeamInfo('b');
      var teamInfo3: ITeamInfo = ModelInfoMockFactory.createTeamInfo('c');
      var createTeamsPromise: Promise<Team[]> = Promise.all([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        TeamsDataHandler.createTeam(teamInfo3)
      ]);

      // Act
      var getTeamsPromise: Promise<Team[]> =
        createTeamsPromise.then(() => TeamsDataHandler.getTeams());

      // Assert
      var expectedInfos: ITeamInfo[] = [teamInfo1, teamInfo2, teamInfo3];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(getTeamsPromise,
        expectedInfos,
        ModelInfoComparers.compareTeamInfos);
    });

  });

  describe('addTeamMember', () => {

    it('should create a team member', () => {
      // Act
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);

      var createTeamAndUserPromise: Promise<any[]> = Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo),
        UserDataHandler.createUser(userInfo)
      ]);

      var teamMemberPromise: Promise<TeamMember> =
        createTeamAndUserPromise.then((teamAndUser: any[]) => {
          var team: Team = teamAndUser[0];
          var user: User = teamAndUser[1];

          var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team, user);

          return TeamsDataHandler.addTeamMember(teamMemberInfo);
        });

      // Assert
      return expect(teamMemberPromise).to.eventually.fulfilled;
    });

  });

  describe('removeTeamMember', () => {

    var testModels: ITestModels;

    beforeEach(() => {
      return EnvironmentDirtifier.fillAllTables()
        .then((_testModels: ITestModels) => {
          testModels = _testModels;
        })
    })

    it('not existing team id should not fail', () => {
      // Arrange
      var teamMember: TeamMember = testModels.teamMembers[0];

      // Act
      var promise: Promise<TeamMember> =
        TeamsDataHandler.removeTeamMember(9999, teamMember.attributes.user_id);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('not existing user id should not fail', () => {
      // Arrange
      var teamMember: TeamMember = testModels.teamMembers[0];

      // Act
      var promise: Promise<TeamMember> =
        TeamsDataHandler.removeTeamMember(teamMember.attributes.team_id, 99999);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing team member should not fail', () => {
      // Arrange
      var teamMemberToDelete: TeamMember = testModels.teamMembers[0];
      var teamId: number = teamMemberToDelete.attributes.team_id;
      var userId: number = teamMemberToDelete.attributes.user_id;

      // Act
      var promise: Promise<TeamMember> =
        TeamsDataHandler.removeTeamMember(teamId, userId);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing team member should remove the team member', () => {
      // Arrange
      var teamMemberToDelete: TeamMember = testModels.teamMembers[0];
      var teamId: number = teamMemberToDelete.attributes.team_id;
      var userId: number = teamMemberToDelete.attributes.user_id;

      // Act
      var promise: Promise<TeamMember> =
        TeamsDataHandler.removeTeamMember(teamId, userId);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamMembers().fetch())
        .then((_teamMembersCollection: Collection<TeamMember>) => {
          return _teamMembersCollection.toArray();
        })
        .then((_teamMembers: TeamMember[]) => {
          return _.map(_teamMembers, _ => _.id);
        })
        .then((teamMemberIds: number[]) => {
          expect(teamMemberIds).not.to.contain(teamMemberToDelete.id);
        });
    });

  });

  describe('getTeamMembers', () => {

    interface IUserIdToIsAdmin {
      userId: number;
      isAdmin: boolean;
    }

    function verifyUsersAdminSettingsWithoutOrderAsync(actualUserOfATeamsPromise: Promise<IUserOfATeam[]>,
      expectedAdminSettings: IUserIdToIsAdmin[]): Promise<void> {

      return expect(actualUserOfATeamsPromise).to.eventually.fulfilled
        .then((actualTeams: IUserOfATeam[]) => {
          var orderedActualUsers: IUserOfATeam[] = _.orderBy(actualTeams, _ => _.user.id);
          var actualIsAdmin: boolean[] = _.map(orderedActualUsers, _ => _.isAdmin);

          var orderedExpectedAdminSettings: IUserIdToIsAdmin[] = _.orderBy(expectedAdminSettings, _ => _.userId);
          var expectedIsAdmin: boolean[] = _.map(orderedExpectedAdminSettings, _ => _.isAdmin);

          expect(actualIsAdmin).to.deep.equal(expectedIsAdmin);
        });
    }

    var userInfo1: IUserInfo;
    var userInfo2: IUserInfo;
    var userInfo3: IUserInfo;
    var user1: User;
    var user2: User;
    var user3: User;

    var teamInfo1: ITeamInfo;
    var teamInfo2: ITeamInfo;
    var team1: Team;
    var team2: Team;

    beforeEach(() => {
      userInfo1 = ModelInfoMockFactory.createUserInfo(1);
      userInfo2 = ModelInfoMockFactory.createUserInfo(2);
      userInfo3 = ModelInfoMockFactory.createUserInfo(3);

      teamInfo1 = ModelInfoMockFactory.createTeamInfo('a');
      teamInfo2 = ModelInfoMockFactory.createTeamInfo('b');

      return Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2),
        UserDataHandler.createUser(userInfo3)
      ]).then((teamAndUsers: any[]) => {
        team1 = teamAndUsers[0];
        team2 = teamAndUsers[1];
        user1 = teamAndUsers[2];
        user2 = teamAndUsers[3];
        user3 = teamAndUsers[4];
      });
    });

    it('not existing team should return empty', () => {
      // Act
      var teamMembersPromise: Promise<IUserOfATeam[]> =
        TeamsDataHandler.getTeamMembers(999999);

      // Assert
      return expect(teamMembersPromise).to.eventually.deep.equal([]);
    });

    it('no team members should return empty', () => {
      // Act
      var teamMembersPromise: Promise<IUserOfATeam[]> =
        TeamsDataHandler.getTeamMembers(team1.id);

      // Assert
      return expect(teamMembersPromise).to.eventually.deep.equal([]);
    });

    it('should return all existing team members', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user2);

      var createAllTeamMembersPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2)
        ]);

      // Act
      var usersPromise: Promise<User[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(team1.id))
          .then((teamMembers: IUserOfATeam[]) => {
            return _.map(teamMembers, _ => _.user);
          })

      // Assert
      var expectedUserInfo: IUserInfo[] = [userInfo1, userInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromise,
        expectedUserInfo,
        ModelInfoComparers.compareUserInfos);
    });

    it('should return all existing team members with correct admin rights', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo1.is_admin = true;
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
      teamMemberInfo2.is_admin = false;
      var teamMemberInfo3: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user3);
      teamMemberInfo3.is_admin = true;

      var createAllTeamMembersPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2),
          TeamsDataHandler.addTeamMember(teamMemberInfo3)
        ]);

      // Act
      var teamMembersPromise: Promise<IUserOfATeam[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(team1.id));

      // Assert
      var expectedUserAdminConfigurations: IUserIdToIsAdmin[] = [
        { userId: teamMemberInfo1.user_id, isAdmin: teamMemberInfo1.is_admin },
        { userId: teamMemberInfo2.user_id, isAdmin: teamMemberInfo2.is_admin },
        { userId: teamMemberInfo3.user_id, isAdmin: teamMemberInfo3.is_admin }
      ];
      return verifyUsersAdminSettingsWithoutOrderAsync(teamMembersPromise, expectedUserAdminConfigurations);
    });

    it('should return all existing team members and not return other members', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user2);

      var teamMemberInfo3: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
      var teamMemberInfo4: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team2, user3);

      var createAllTeamMembersPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2),
          TeamsDataHandler.addTeamMember(teamMemberInfo3),
          TeamsDataHandler.addTeamMember(teamMemberInfo4)
        ]);

      // Act
      var usersPromise: Promise<User[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(team1.id))
          .then((usersOfATeam: IUserOfATeam[]) => {
            return _.map(usersOfATeam, _ => _.user);
          });

      // Assert
      var expectedUserInfo: IUserInfo[] = [userInfo1, userInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromise,
        expectedUserInfo,
        ModelInfoComparers.compareUserInfos);
    });

  });

  describe('addTeamSkill', () => {

    it('should create a team skill', () => {
      // Act
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skill1');

      var createTeamAndSkillsPromise: Promise<any[]> = Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo),
        SkillsDataHandler.createSkill(skillInfo)
      ]);

      var teamSkillPromise: Promise<TeamSkill> =
        createTeamAndSkillsPromise.then((teamAndSkill: any[]) => {
          var team: Team = teamAndSkill[0];
          var skill: Skill = teamAndSkill[1];

          var teamSkillInfo: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team, skill);

          return TeamsDataHandler.addTeamSkill(teamSkillInfo);
        });

      // Assert
      return expect(teamSkillPromise).to.eventually.fulfilled;
    });

  });

  describe('removeTeamSkill', () => {

    var testModels: ITestModels;

    beforeEach(() => {
      return EnvironmentDirtifier.fillAllTables()
        .then((_testModels: ITestModels) => {
          testModels = _testModels;
        })
    })

    it('not existing team id should not fail', () => {
      // Arrange
      var teamSkill: TeamSkill = testModels.teamSkills[0];

      // Act
      var promise: Promise<TeamSkill> =
        TeamsDataHandler.removeTeamSkill(9999, teamSkill.attributes.skill_id);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('not existing skill id should not fail', () => {
      // Arrange
      var teamSkill: TeamSkill = testModels.teamSkills[0];

      // Act
      var promise: Promise<TeamSkill> =
        TeamsDataHandler.removeTeamSkill(teamSkill.attributes.team_id, 99999);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing team skill should not fail', () => {
      // Arrange
      var teamSkillToDelete: TeamSkill = testModels.teamSkills[0];
      var teamId: number = teamSkillToDelete.attributes.team_id;
      var skillId: number = teamSkillToDelete.attributes.skill_id;

      // Act
      var promise: Promise<TeamSkill> =
        TeamsDataHandler.removeTeamSkill(teamId, skillId);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing team skill should remove the team skill', () => {
      // Arrange
      var teamSkillToDelete: TeamSkill = testModels.teamSkills[0];
      var teamId: number = teamSkillToDelete.attributes.team_id;
      var skillId: number = teamSkillToDelete.attributes.skill_id;

      // Act
      var promise: Promise<TeamSkill> =
        TeamsDataHandler.removeTeamSkill(teamId, skillId);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkills().fetch())
        .then((_teamSkillsCollection: Collection<TeamSkill>) => {
          return _teamSkillsCollection.toArray();
        })
        .then((_teamSkills: TeamSkill[]) => {
          return _.map(_teamSkills, _ => _.id);
        })
        .then((teamSkillIds: number[]) => {
          expect(teamSkillIds).not.to.contain(teamSkillToDelete.id);
        });
    });

    it('existing team skill should remove all the team skill upvotes', () => {
      // Arrange
      var teamSkillToDelete: TeamSkill = testModels.teamSkills[0];
      var teamId: number = teamSkillToDelete.attributes.team_id;
      var skillId: number = teamSkillToDelete.attributes.skill_id;

      // Act
      var promise: Promise<TeamSkill> =
        TeamsDataHandler.removeTeamSkill(teamId, skillId);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkillUpvotes().fetch())
        .then((_teamSkillUpvotesCollection: Collection<TeamSkillUpvote>) => {
          return _teamSkillUpvotesCollection.toArray();
        })
        .then((_teamSkillUpvotes: TeamSkillUpvote[]) => {
          return _.map(_teamSkillUpvotes, _ => _.attributes.team_skill_id);
        })
        .then((teamSkillIds: number[]) => {
          expect(teamSkillIds).not.to.contain(teamSkillToDelete.id);
        });
    });

  });

  describe('getTeamSkills', () => {

    interface ISkillIdToUpvotes {
      skillId: number;
      upvotingUserIds: number[];
    }

    function verifySkillsUpvotesWithoutOrderAsync(actualSkillsOfATeamPromise: Promise<ISkillOfATeam[]>,
      expectedSkillIdToUpvotes: ISkillIdToUpvotes[]): Promise<void> {

      return expect(actualSkillsOfATeamPromise).to.eventually.fulfilled
        .then((actualSkills: ISkillOfATeam[]) => {
          var orderedActualUsers: ISkillOfATeam[] = _.orderBy(actualSkills, _ => _.skill.id);
          var actualUpvotingUserIds: number[][] = _.map(orderedActualUsers, _ => _.upvotingUserIds.sort());

          var orderedExpectedUpvotes: ISkillIdToUpvotes[] = _.orderBy(expectedSkillIdToUpvotes, _ => _.skillId);
          var expectedUpvotingUserIds: number[][] = _.map(orderedExpectedUpvotes, _ => _.upvotingUserIds.sort());

          expect(actualUpvotingUserIds).to.deep.equal(expectedUpvotingUserIds);
        });
    }

    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;
    var skillInfo3: ISkillInfo;
    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    var teamInfo1: ITeamInfo;
    var teamInfo2: ITeamInfo;
    var team1: Team;
    var team2: Team;

    var userInfo1: IUserInfo;
    var userInfo2: IUserInfo;
    var user1: User;
    var user2: User;

    beforeEach(() => {
      skillInfo1 = ModelInfoMockFactory.createSkillInfo('skill1');
      skillInfo2 = ModelInfoMockFactory.createSkillInfo('skill2');
      skillInfo3 = ModelInfoMockFactory.createSkillInfo('skill3');

      teamInfo1 = ModelInfoMockFactory.createTeamInfo('a');
      teamInfo2 = ModelInfoMockFactory.createTeamInfo('b');

      userInfo1 = ModelInfoMockFactory.createUserInfo(1);
      userInfo2 = ModelInfoMockFactory.createUserInfo(2);

      return Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        SkillsDataHandler.createSkill(skillInfo3),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ]).then((results: any[]) => {
        team1 = results[0];
        team2 = results[1];
        skill1 = results[2];
        skill2 = results[3];
        skill3 = results[4];
        user1 = results[5];
        user2 = results[6];
      });
    });

    it('not existing team should return empty', () => {
      // Act
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        TeamsDataHandler.getTeamSkills(99999);

      // Assert
      return expect(teamSkillsPromise).to.eventually.deep.equal([]);
    });

    it('no team members should return empty', () => {
      // Act
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        TeamsDataHandler.getTeamSkills(team1.id);

      // Assert
      return expect(teamSkillsPromise).to.eventually.deep.equal([]);
    });

    it('should return all existing team skills', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);

      var createAllTeamSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(team1.id))
          .then((skillsOfATeam: ISkillOfATeam[]) => {
            return _.map(skillsOfATeam, _ => _.skill);
          });

      // Assert
      var expectedSkillInfo: ISkillInfo[] = [skillInfo1, skillInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise,
        expectedSkillInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('should return correct teamSkills', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);

      var createAllTeamSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2)
        ]);

      // Act
      var teamSkillsPromise: Promise<TeamSkill[]> =
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(team1.id))
          .then((skillsOfATeam: ISkillOfATeam[]) => {
            return _.map(skillsOfATeam, _ => _.teamSkill);
          });

      // Assert
      var expectedTeamSkillInfo: ITeamSkillInfo[] = [teamSkillInfo1, teamSkillInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamSkillsPromise,
        expectedTeamSkillInfo,
        ModelInfoComparers.compareTeamSkillInfos);
    });

    it('should return all existing team skills with correct upvoting user ids', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
      var teamSkillInfo3: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill3);

      var createAllTeamSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3)
        ]);

      // Act
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(team1.id));

      // Assert
      var expectedSkillUpvotes: ISkillIdToUpvotes[] = [
        { skillId: teamSkillInfo1.skill_id, upvotingUserIds: [] },
        { skillId: teamSkillInfo2.skill_id, upvotingUserIds: [] },
        { skillId: teamSkillInfo3.skill_id, upvotingUserIds: [] }
      ];
      return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
    });

    it('should return all existing skills and not return other skills', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);

      var teamSkillInfo3: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
      var teamSkillInfo4: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team2, skill3);

      var createAllTeamSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3),
          TeamsDataHandler.addTeamSkill(teamSkillInfo4)
        ]);

      // Act
      var teamSkillsPromise: Promise<Skill[]> =
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(team1.id))
          .then((skillsOfATeam: ISkillOfATeam[]) => {
            return _.map(skillsOfATeam, _ => _.skill);
          });

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [skillInfo1, skillInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamSkillsPromise,
        expectedSkillsInfo,
        ModelInfoComparers.compareSkillInfos);
    });

    it('after upvoting skills should return all existing team skills with correct upvoting user ids', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
      var teamSkillInfo3: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team1, skill3);

      var createSkillsAndUpvotePromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3)
        ]).then((teamSkills: TeamSkill[]) => {
          var [teamSkill1, teamSkill2, teamSkill3] = teamSkills;

          return Promise.all([
            TeamsDataHandler.upvoteTeamSkill(teamSkill1.id, user1.id),
            TeamsDataHandler.upvoteTeamSkill(teamSkill1.id, user2.id),
            TeamsDataHandler.upvoteTeamSkill(teamSkill2.id, user2.id)
          ])
        });

      // Act
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        createSkillsAndUpvotePromise.then(() => TeamsDataHandler.getTeamSkills(team1.id));

      // Assert
      var expectedSkillUpvotes: ISkillIdToUpvotes[] = [
        { skillId: skill1.id, upvotingUserIds: [user1.id, user2.id] },
        { skillId: skill2.id, upvotingUserIds: [user2.id] },
        { skillId: skill3.id, upvotingUserIds: [] }
      ];
      return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
    });

  });

  describe('upvoteTeamSkill', () => {

    var teamInfo: ITeamInfo;
    var team: Team;

    var user1: User;
    var user2: User;

    var teamSkill: TeamSkill;

    beforeEach(() => {
      teamInfo = ModelInfoMockFactory.createTeamInfo('team 1');
      var skillInfo = ModelInfoMockFactory.createSkillInfo('skill 1');
      var userInfo1 = ModelInfoMockFactory.createUserInfo(1);
      var userInfo2 = ModelInfoMockFactory.createUserInfo(2);

      return Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo),
        SkillsDataHandler.createSkill(skillInfo),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ]).then((teamSkillAndUser: any[]) => {
        team = teamSkillAndUser[0];
        var skill: Skill = teamSkillAndUser[1];

        user1 = teamSkillAndUser[2];
        user2 = teamSkillAndUser[3];

        var teamSkillInfo: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team, skill);

        return TeamsDataHandler.addTeamSkill(teamSkillInfo);
      }).then((_teamSkill: TeamSkill) => {
        teamSkill = _teamSkill;
      });
    });

    it('upvote with non existing team skill id should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id + 1;
      var userId: number = user1.id;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);

      // Assert
      return expect(upvotePromise).to.eventually.rejected;
    });

    it('upvote with non existing user id should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = user1.id + user2.id + 1;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);

      // Assert
      return expect(upvotePromise).to.eventually.rejected;
    });

    it('upvote should set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = user1.id;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);

      // Assert
      return expect(upvotePromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([userId]);
        });
    });

    it('upvote with same user twice should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = user1.id;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId)
          .then(() => TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId));

      // Assert
      return expect(upvotePromise).to.eventually.rejected;
    });

    it('upvote with same user twice should set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = user1.id;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId)
          .then(() => TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId));

      // Assert
      return expect(upvotePromise).to.eventually.rejected
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([userId]);
        });
    });

    it('upvote with different user twice set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId1: number = user1.id;
      var userId2: number = user2.id;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId1)
          .then(() => TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId2));

      // Assert
      return expect(upvotePromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([userId1, userId2].sort());
        });
    });

  });

  describe('removeUpvoteForTeamSkill', () => {

    var upvotedUser1: User;
    var upvotedUser2: User;
    var notUpvotedUser: User;

    var teamInfo: ITeamInfo;
    var team: Team;

    var teamSkill: TeamSkill;

    beforeEach(() => {
      teamInfo = ModelInfoMockFactory.createTeamInfo('team 1');
      var skillInfo = ModelInfoMockFactory.createSkillInfo('skill 1');
      var upvotedUserInfo1 = ModelInfoMockFactory.createUserInfo(1);
      var upvotedUserInfo2 = ModelInfoMockFactory.createUserInfo(2);
      var notUpvotedUserInfo = ModelInfoMockFactory.createUserInfo(3);
      //
      return Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo),
        SkillsDataHandler.createSkill(skillInfo),
        UserDataHandler.createUser(upvotedUserInfo1),
        UserDataHandler.createUser(upvotedUserInfo2),
        UserDataHandler.createUser(notUpvotedUserInfo)
      ]).then((teamSkillAndUser: any[]) => {
        team = teamSkillAndUser[0];
        var skill: Skill = teamSkillAndUser[1];

        upvotedUser1 = teamSkillAndUser[2];
        upvotedUser2 = teamSkillAndUser[3];
        notUpvotedUser = teamSkillAndUser[4];

        var teamSkillInfo: ITeamSkillInfo = ModelInfoMockFactory.createTeamSkillInfo(team, skill);

        return TeamsDataHandler.addTeamSkill(teamSkillInfo);
      }).then((_teamSkill: TeamSkill) => {
        teamSkill = _teamSkill;

        return Promise.all([
          TeamsDataHandler.upvoteTeamSkill(teamSkill.id, upvotedUser1.id),
          TeamsDataHandler.upvoteTeamSkill(teamSkill.id, upvotedUser2.id)
        ]);
      });
    });

    it('with non existing team skill id should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id + 1;
      var userId: number = upvotedUser1.id;

      // Act
      var promise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('with non existing user id should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = upvotedUser1.id + upvotedUser2.id + notUpvotedUser.id + 1;

      // Act
      var promise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('with user who did not upvote should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = notUpvotedUser.id;

      // Act
      var promise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('with user who did not upvote should set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = notUpvotedUser.id;

      // Act
      var removeUpvotePromise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);

      // Assert
      return expect(removeUpvotePromise).to.eventually.rejected
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([upvotedUser1.id, upvotedUser2.id].sort());
        });
    });

    it('with user who upvoted should set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = upvotedUser1.id;

      // Act
      var removeUpvotePromise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);

      // Assert
      return expect(removeUpvotePromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([upvotedUser2.id]);
        });
    });

    it('with same user twice should fail', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = upvotedUser1.id;

      // Act
      var removeUpvotePromise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId)
          .then(() => TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId));

      // Assert
      return expect(removeUpvotePromise).to.eventually.rejected;
    });

    it('with same user twice should set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = upvotedUser1.id;

      // Act
      var removeUpvotePromise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId)
          .then(() => TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId));

      // Assert
      return expect(removeUpvotePromise).to.eventually.rejected
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([upvotedUser2.id]);
        });
    });

    it('with different user twice set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId1: number = upvotedUser1.id;
      var userId2: number = upvotedUser2.id;

      // Act
      var upvotePromise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId1)
          .then(() => TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId2));

      // Assert
      return expect(upvotePromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamSkills(team.id))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([]);
        });
    });

  });

  describe('setAdminRights', () => {
    var teamInfo: ITeamInfo;
    var team: Team;

    var teamMemberInfo: ITeamMemberInfo;
    var userInfo: IUserInfo;

    beforeEach(() => {
      teamInfo = ModelInfoMockFactory.createTeamInfo('team 1');
      userInfo = ModelInfoMockFactory.createUserInfo(1);

      return Promise.all<any>([
        TeamsDataHandler.createTeam(teamInfo),
        UserDataHandler.createUser(userInfo)
      ]).then((teamAndUser: any[]) => {
        team = teamAndUser[0];
        var user: User = teamAndUser[1];

        teamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team, user);
        teamMemberInfo.is_admin = false;

        return TeamsDataHandler.addTeamMember(teamMemberInfo);
      });
    });

    it('with non existing team id should fail', () => {
      // Arrange
      var teamId: number = teamMemberInfo.team_id + 1;
      var userId: number = teamMemberInfo.user_id;

      // Act
      var adminRightsPromise: Promise<any> =
        TeamsDataHandler.setAdminRights(teamId, userId, true);

      // Assert
      return expect(adminRightsPromise).to.eventually.rejected;
    });

    it('with non existing user id should fail', () => {
      // Arrange
      var teamId: number = teamMemberInfo.team_id;
      var userId: number = teamMemberInfo.user_id + 1;

      // Act
      var adminRightsPromise: Promise<any> =
        TeamsDataHandler.setAdminRights(teamId, userId, true);

      // Assert
      return expect(adminRightsPromise).to.eventually.rejected;
    });

    it('should update the is_admin to true correctly', () => {
      // Arrange
      var teamId: number = teamMemberInfo.team_id;
      var userId: number = teamMemberInfo.user_id;

      // Act
      var adminRightsPromise: Promise<any> =
        TeamsDataHandler.setAdminRights(teamId, userId, true);

      // Assert
      return expect(adminRightsPromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamMembers(team.id))
        .then((usersOfATeam: IUserOfATeam[]) => {
          expect(usersOfATeam.length).to.be.equal(1);
          expect(usersOfATeam[0].isAdmin).to.be.true;
        });
    });

    it('should update the is_admin to false correctly', () => {
      // Arrange
      var teamId: number = teamMemberInfo.team_id;
      var userId: number = teamMemberInfo.user_id;

      // Act
      var adminRightsPromise: Promise<any> =
        TeamsDataHandler.setAdminRights(teamId, userId, true)
          .then(() => TeamsDataHandler.setAdminRights(teamId, userId, false));

      // Assert
      return expect(adminRightsPromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamMembers(team.id))
        .then((usersOfATeam: IUserOfATeam[]) => {
          expect(usersOfATeam.length).to.be.equal(1);
          expect(usersOfATeam[0].isAdmin).to.be.false;
        });
    });

  });

  describe('getSkillsOfTeams', () => {

    function createTeamToSkills(team: Team, teamSkills: TeamSkill[], skills: Skill[]): ISkillsOfATeam {
      var result: ISkillsOfATeam = {
        team: team,
        skills: []
      };

      for (var i = 0; i < teamSkills.length; i++) {
        result.skills.push({
          skill: skills[i],
          teamSkill: teamSkills[i],
          upvotingUserIds: []
        })
      }

      return result;
    }

    function verifyTeamsToSkills(actual: ISkillsOfATeam[], expected: ISkillsOfATeam[]): void {
      expect(actual.length, 'The number of skills of a team should be correct').to.be.equal(expected.length);

      var actualOrdered: ISkillsOfATeam[] = _.orderBy(actual, _ => _.team.id);
      var expectedOrdered: ISkillsOfATeam[] = _.orderBy(expected, _ => _.team.id);

      for (var i = 0; i < expected.length; i++) {
        var actualSkillsOfATeam: ISkillsOfATeam = actualOrdered[i];
        var expectedSkillsOfATeam: ISkillsOfATeam = expectedOrdered[i];

        expect(actualSkillsOfATeam.team.id).to.be.equal(expectedSkillsOfATeam.team.id);

        verifyTeamToSkills(actualSkillsOfATeam.skills, expectedSkillsOfATeam.skills);
      }
    }

    function verifyTeamToSkills(actual: ISkillOfATeam[], expected: ISkillOfATeam[]): void {
      expect(actual.length, 'The number of team skills should be correct').to.be.equal(expected.length);

      var actualOrdered: ISkillOfATeam[] = _.orderBy(actual, _ => _.skill.id);
      var expectedOrdered: ISkillOfATeam[] = _.orderBy(expected, _ => _.skill.id);

      for (var i = 0; i < expected.length; i++) {
        var actualSkillOfATeam: ISkillOfATeam = actualOrdered[i];
        var expectedSkillOfATeam: ISkillOfATeam = expectedOrdered[i];

        expect(actualSkillOfATeam.skill.id).to.be.equal(expectedSkillOfATeam.skill.id);
        expect(actualSkillOfATeam.teamSkill.id).to.be.equal(expectedSkillOfATeam.teamSkill.id);
        expect(actualSkillOfATeam.upvotingUserIds.sort(), 'The upvotingUserIds should be correct').to.be.deep.equal(expectedSkillOfATeam.upvotingUserIds.sort());
      }
    }

    it('no teams should return empty mapping', () => {
      // Act
      var promise: Promise<ISkillsOfATeam[]> =
        TeamsDataHandler.getSkillsOfTeams();

      // Arrange
      return expect(promise).to.eventually.deep.equal([]);
    });

    it('teams without skills should return correct result', () => {
      // Arrange
      var numberOfTeams = 5;
      var teams: Team[];
      var expectedTeamsToSkills: ISkillsOfATeam[];

      var addTeamsPromise: Promise<Team[]> =
        EnvironmentDirtifier.createTeams(numberOfTeams)
          .then((_teams: Team[]) => {
            teams = _teams;

            expectedTeamsToSkills =
              _.map(_teams, _team => {
                return <ISkillsOfATeam>{
                  team: _team,
                  skills: []
                }
              });

            return _teams;
          });

      // Act
      var promise: Promise<ISkillsOfATeam[]> =
        addTeamsPromise.then(() => TeamsDataHandler.getSkillsOfTeams());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_teamsToSkills: ISkillsOfATeam[]) => {
          verifyTeamsToSkills(_teamsToSkills, expectedTeamsToSkills);
        });
    });

    it('has teams with skills should return correct result', () => {
      // Arrange
      var numberOfTeams = 3;
      var teams: Team[];
      var addTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(numberOfTeams)
          .then((_teams: Team[]) => {
            teams = _teams;
          });

      var numberOfSkills = 4;
      var skills: Skill[];
      var addSkillsPromise: Promise<any> =
        EnvironmentDirtifier.createSkills(numberOfSkills)
          .then((_skills: Skill[]) => {
            skills = _skills;
          });

      var team1Skills: TeamSkill[];
      var team2Skills: TeamSkill[];
      var team3Skills: TeamSkill[];
      var addTeamSkillsPromise: Promise<any> =
        Promise.all([addTeamsPromise, addSkillsPromise])
          .then(() => Promise.all([
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[0])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[1])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[1])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[2])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[2])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[3]))
          ]))
          .then((_teamSkills: TeamSkill[]) => {
            team1Skills = [_teamSkills[0], _teamSkills[1]];
            team2Skills = [_teamSkills[2], _teamSkills[3]];
            team3Skills = [_teamSkills[4], _teamSkills[5]];
          });

      var expectedTeamsToSkills: ISkillsOfATeam[];
      var teamsToSkillsPromise: Promise<any> =
        addTeamSkillsPromise.then(() => {
          var expectedTeam1ToSkills: ISkillsOfATeam = createTeamToSkills(teams[0], team1Skills, [skills[0], skills[1]]);
          var expectedTeam2ToSkills: ISkillsOfATeam = createTeamToSkills(teams[1], team2Skills, [skills[1], skills[2]]);
          var expectedTeam3ToSkills: ISkillsOfATeam = createTeamToSkills(teams[2], team3Skills, [skills[2], skills[3]]);

          expectedTeamsToSkills = [expectedTeam1ToSkills, expectedTeam2ToSkills, expectedTeam3ToSkills];
        });

      // Act
      var promise: Promise<ISkillsOfATeam[]> =
        teamsToSkillsPromise.then(() => TeamsDataHandler.getSkillsOfTeams());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_actualTeamsToSkills: ISkillsOfATeam[]) => {
          verifyTeamsToSkills(_actualTeamsToSkills, expectedTeamsToSkills);
        });
    });

    it('has teams with skills with upvotes should return correct result', () => {
      // Arrange
      var numberOfTeams = 3;
      var teams: Team[];
      var addTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(numberOfTeams)
          .then((_teams: Team[]) => {
            teams = _teams;
          });

      var numberOfSkills = 4;
      var skills: Skill[];
      var addSkillsPromise: Promise<any> =
        EnvironmentDirtifier.createSkills(numberOfSkills)
          .then((_skills: Skill[]) => {
            skills = _skills;
          });

      var team1Skills: TeamSkill[];
      var team2Skills: TeamSkill[];
      var team3Skills: TeamSkill[];
      var addTeamSkillsPromise: Promise<any> =
        Promise.all([addTeamsPromise, addSkillsPromise])
          .then(() => Promise.all([
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[0])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[1])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[1])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[2])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[2])),
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[3]))
          ]))
          .then((_teamSkills: TeamSkill[]) => {
            team1Skills = [_teamSkills[0], _teamSkills[1]];
            team2Skills = [_teamSkills[2], _teamSkills[3]];
            team3Skills = [_teamSkills[4], _teamSkills[5]];
          });

      var expectedTeamsToSkills: ISkillsOfATeam[];
      var teamsToSkillsPromise: Promise<any> =
        addTeamSkillsPromise.then(() => {
          var expectedTeam1ToSkills: ISkillsOfATeam = createTeamToSkills(teams[0], team1Skills, [skills[0], skills[1]]);
          var expectedTeam2ToSkills: ISkillsOfATeam = createTeamToSkills(teams[1], team2Skills, [skills[1], skills[2]]);
          var expectedTeam3ToSkills: ISkillsOfATeam = createTeamToSkills(teams[2], team3Skills, [skills[2], skills[3]]);

          expectedTeamsToSkills = [expectedTeam1ToSkills, expectedTeam2ToSkills, expectedTeam3ToSkills];
        });

      var user1: User;
      var user2: User;
      var upvotingPromise: Promise<any> =
        teamsToSkillsPromise.then(() =>
          Promise.all([
            UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
            UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
          ])).then((_users: User[]) => {
            [user1, user2] = _users;
          }).then(() => Promise.all([
            TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[0].skills[0].teamSkill.id, user1.id),
            TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[0].skills[0].teamSkill.id, user2.id),
            TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[1].skills[0].teamSkill.id, user1.id),
            TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[2].skills[1].teamSkill.id, user2.id),
          ])).then(() => {
            expectedTeamsToSkills[0].skills[0].upvotingUserIds = [user1.id, user2.id];
            expectedTeamsToSkills[1].skills[0].upvotingUserIds = [user1.id];
            expectedTeamsToSkills[2].skills[1].upvotingUserIds = [user2.id];
          });

      // Act
      var promise: Promise<ISkillsOfATeam[]> =
        upvotingPromise.then(() => TeamsDataHandler.getSkillsOfTeams());

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then((_actualTeamsToSkills: ISkillsOfATeam[]) => {
          verifyTeamsToSkills(_actualTeamsToSkills, expectedTeamsToSkills);
        });
    });

  });

  describe('getNumberOfTeams', () => {

    it('no teams should return 0', () => {
      // Act
      var resultPromise: Promise<number> =
        TeamsDataHandler.getNumberOfTeams();

      // Assert
      return expect(resultPromise).to.eventually.equal(0);
    });

    it('has teams should return correct number', () => {
      // Arrangev
      var numberOfTeams = 12;
      var createTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(numberOfTeams);

      // Act
      var resultPromise: Promise<number> =
        createTeamsPromise.then(() => TeamsDataHandler.getNumberOfTeams());

      // Assert
      return expect(resultPromise).to.eventually.equal(numberOfTeams);
    });

  });

});
