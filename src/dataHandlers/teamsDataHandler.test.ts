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

  function clearTables(): Promise<any> {
    return TeamSkillUpvotes.clearAll()
      .then(() => Promise.all([
        TeamMembers.clearAll(),
        TeamSkills.clearAll()
      ])).then(() => Promise.all([
        Teams.clearAll(),
        Users.clearAll(),
        Skills.clearAll()
      ]));
  }

  function verifyTeamInfoAsync(actualTeamPromise: Promise<Team>,
    expectedTeamInfo: ITeamInfo): Promise<void> {

    return expect(actualTeamPromise).to.eventually.fulfilled
      .then((team: Team) => {
        verifyTeamInfo(team.attributes, expectedTeamInfo);
      });
  }

  function verifyTeamInfo(actual: ITeamInfo, expected: ITeamInfo): void {
    var actualCloned: ITeamInfo = _.clone(actual);
    var expectedCloned: ITeamInfo = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  beforeEach(() => {
    return clearTables();
  });

  afterEach(() => {
    return clearTables();
  });

  describe('createTeam', () => {

    it('should create a team correctly', () => {
      // Act
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var teamPromise: Promise<Team> =
        TeamsDataHandler.createTeam(teamInfo);

      // Assert
      return verifyTeamInfoAsync(teamPromise, teamInfo);
    });

  });

  describe('getTeam', () => {

    it('no such team should return null', () => {
      // Act
      var teamPromise: Promise<Team> =
        TeamsDataHandler.getTeam('not existing team');

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
        createTeamPromose.then(() => TeamsDataHandler.getTeam(teamInfo.name));

      // Assert
      return verifyTeamInfoAsync(getTeamPromise, teamInfo);
    });

  });

  describe('addTeamMember', () => {

    it('should create a team member', () => {
      // Act
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);

      var createTeamAndUserPromise: Promise<any[]> = Promise.all([
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

  describe('getTeamMembers', () => {

    interface IUserIdToIsAdmin {
      userId: number;
      isAdmin: boolean;
    }

    function verifyUsersInfoWithoutOrderAsync(actualUsersPromise: Promise<IUserOfATeam[]>,
      expectedUsersInfo: IUserInfo[]): Promise<void> {

      return expect(actualUsersPromise).to.eventually.fulfilled
        .then((users: IUserOfATeam[]) => {

          var actualUserInfos: IUserInfo[] = _.map(users, _ => _.user.attributes);

          verifyUsersInfoWithoutOrder(actualUserInfos, expectedUsersInfo);
        });
    }

    function verifyUsersInfoWithoutOrder(actual: IUserInfo[], expected: IUserInfo[]): void {
      var actualOrdered = _.orderBy(actual, _ => _.username);
      var expectedOrdered = _.orderBy(expected, _ => _.username);

      expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

      for (var i = 0; i < expected.length; i++) {
        verifyUserInfo(actualOrdered[i], expectedOrdered[i]);
      }
    }

    function verifyUserInfo(actual: IUserInfo, expected: IUserInfo): void {
      var actualCloned: IUserInfo = _.clone(actual);
      var expectedCloned: IUserInfo = _.clone(expected);

      delete actualCloned['id'];
      delete expectedCloned['id'];

      expect(actualCloned).to.be.deep.equal(expectedCloned);
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

      return Promise.all([
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
        TeamsDataHandler.getTeamMembers('not existing team');

      // Assert
      return expect(teamMembersPromise).to.eventually.deep.equal([]);
    });

    it('no team members should return empty', () => {
      // Act
      var teamMembersPromise: Promise<IUserOfATeam[]> =
        TeamsDataHandler.getTeamMembers(teamInfo1.name);

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
      var teamMembersPromise: Promise<IUserOfATeam[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(teamInfo1.name));

      // Assert
      var expectedUserInfo: IUserInfo[] = [userInfo1, userInfo2];
      return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedUserInfo);
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
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(teamInfo1.name));

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
      var teamMembersPromise: Promise<IUserOfATeam[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(teamInfo1.name));

      // Assert
      var expectedUserInfo: IUserInfo[] = [userInfo1, userInfo2];
      return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedUserInfo);
    });

  });

  describe('addTeamSkill', () => {

    it('should create a team skill', () => {
      // Act
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo('a');
      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skill1');

      var createTeamAndSkillsPromise: Promise<any[]> = Promise.all([
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

  describe('getTeamSkills', () => {

    interface ISkillIdToUpvotes {
      skillId: number;
      upvotingUserIds: number[];
    }

    function verifySkillsInfoWithoutOrderAsync(actualSkillsPromise: Promise<ISkillOfATeam[]>,
      expectedSkillsInfo: ISkillInfo[]): Promise<void> {

      return expect(actualSkillsPromise).to.eventually.fulfilled
        .then((skills: ISkillOfATeam[]) => {

          var actualSkillInfo: ISkillInfo[] = _.map(skills, _ => _.skill.attributes);

          verifySkillsInfoWithoutOrder(actualSkillInfo, expectedSkillsInfo);
        });
    }

    function verifySkillsInfoWithoutOrder(actual: ISkillInfo[], expected: ISkillInfo[]): void {
      var actualOrdered = _.orderBy(actual, _ => _.name);
      var expectedOrdered = _.orderBy(expected, _ => _.name);

      expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

      for (var i = 0; i < expected.length; i++) {
        verifySkillInfo(actualOrdered[i], expectedOrdered[i]);
      }
    }

    function verifySkillInfo(actual: ISkillInfo, expected: ISkillInfo): void {
      var actualCloned: ISkillInfo = _.clone(actual);
      var expectedCloned: ISkillInfo = _.clone(expected);

      delete actualCloned['id'];
      delete expectedCloned['id'];

      expect(actualCloned).to.be.deep.equal(expectedCloned);
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

      return Promise.all([
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
        TeamsDataHandler.getTeamSkills('not existing team');

      // Assert
      return expect(teamSkillsPromise).to.eventually.deep.equal([]);
    });

    it('no team members should return empty', () => {
      // Act
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        TeamsDataHandler.getTeamSkills(teamInfo1.name);

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
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(teamInfo1.name));

      // Assert
      var exxpectedSkillInfo: ISkillInfo[] = [skillInfo1, skillInfo2];
      return verifySkillsInfoWithoutOrderAsync(teamSkillsPromise, exxpectedSkillInfo);
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
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(teamInfo1.name));

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
      var teamSkillsPromise: Promise<ISkillOfATeam[]> =
        createAllTeamSkillsPromise.then(() => TeamsDataHandler.getTeamSkills(teamInfo1.name));

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [skillInfo1, skillInfo2];
      return verifySkillsInfoWithoutOrderAsync(teamSkillsPromise, expectedSkillsInfo);
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
        createSkillsAndUpvotePromise.then(() => TeamsDataHandler.getTeamSkills(teamInfo1.name));

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

    var user1: User;
    var user2: User;

    var teamSkill: TeamSkill;

    beforeEach(() => {
      teamInfo = ModelInfoMockFactory.createTeamInfo('team 1');
      var skillInfo = ModelInfoMockFactory.createSkillInfo('skill 1');
      var userInfo1 = ModelInfoMockFactory.createUserInfo(1);
      var userInfo2 = ModelInfoMockFactory.createUserInfo(2);

      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo),
        SkillsDataHandler.createSkill(skillInfo),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ]).then((teamSkillAndUser: any[]) => {
        var team: Team = teamSkillAndUser[0];
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
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
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
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
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
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
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

    var teamSkill: TeamSkill;

    beforeEach(() => {
      teamInfo = ModelInfoMockFactory.createTeamInfo('team 1');
      var skillInfo = ModelInfoMockFactory.createSkillInfo('skill 1');
      var upvotedUserInfo1 = ModelInfoMockFactory.createUserInfo(1);
      var upvotedUserInfo2 = ModelInfoMockFactory.createUserInfo(2);
      var notUpvotedUserInfo = ModelInfoMockFactory.createUserInfo(3);
      //
      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo),
        SkillsDataHandler.createSkill(skillInfo),
        UserDataHandler.createUser(upvotedUserInfo1),
        UserDataHandler.createUser(upvotedUserInfo2),
        UserDataHandler.createUser(notUpvotedUserInfo)
      ]).then((teamSkillAndUser: any[]) => {
        var team: Team = teamSkillAndUser[0];
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
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([upvotedUser1.id, upvotedUser2.id].sort());
        });
    });

    it('with user who upvote should set the upvoting user ids correctly', () => {
      // Arrange
      var teamSkillId: number = teamSkill.id;
      var userId: number = upvotedUser1.id;

      // Act
      var removeUpvotePromise: Promise<any> =
        TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);

      // Assert
      return expect(removeUpvotePromise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
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
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
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
        .then(() => TeamsDataHandler.getTeamSkills(teamInfo.name))
        .then((skillsOfATeam: ISkillOfATeam[]) => {
          expect(skillsOfATeam.length).to.be.equal(1);
          expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([]);
        });
    });

  });

  describe('setAdminRights', () => {
    var teamInfo: ITeamInfo;
    var teamMemberInfo: ITeamMemberInfo;
    var userInfo: IUserInfo;

    beforeEach(() => {
      teamInfo = ModelInfoMockFactory.createTeamInfo('team 1');
      userInfo = ModelInfoMockFactory.createUserInfo(1);

      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo),
        UserDataHandler.createUser(userInfo)
      ]).then((teamAndUser: any[]) => {
        var team: Team = teamAndUser[0];
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
        .then(() => TeamsDataHandler.getTeamMembers(teamInfo.name))
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
        .then(() => TeamsDataHandler.getTeamMembers(teamInfo.name))
        .then((usersOfATeam: IUserOfATeam[]) => {
          expect(usersOfATeam.length).to.be.equal(1);
          expect(usersOfATeam[0].isAdmin).to.be.false;
        });
    });

  });

});
