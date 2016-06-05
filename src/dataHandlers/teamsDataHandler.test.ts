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
    return Promise.all([
      TeamMembers.clearAll(),
      TeamSkills.clearAll()
    ]).then(() => Promise.all([
      Teams.clearAll(),
      Users.clearAll(),
      Skills.clearAll()
    ]));
  }

  function createTeamInfo(teamName: string): ITeamInfo {
    return {
      name: teamName
    };
  }

  function createUserInfo(userNumber: number): IUserInfo {
    return {
      username: 'username' + userNumber,
      password_hash: 'password_hash' + userNumber,
      email: 'email' + userNumber + '@gmail.com',
      firstName: 'firstName' + userNumber,
      lastName: 'lastName' + userNumber
    };
  }

  function createTeamMemberInfo(team: Team, user: User): ITeamMemberInfo {
    return {
      team_id: team.id,
      user_id: user.id,
      is_admin: false
    }
  }

  function createSkillInfo(skillName: string): ISkillInfo {
    return {
      name: skillName
    }
  }

  function createTeamSkillInfo(team: Team, skill: Skill): ITeamSkillInfo {
    return {
      team_id: team.id,
      skill_id: skill.id,
      upvotes: 0
    }
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
      var teamInfo: ITeamInfo = createTeamInfo('a');
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
      var teamInfo: ITeamInfo = createTeamInfo('a');
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
      var teamInfo: ITeamInfo = createTeamInfo('a');
      var userInfo: IUserInfo = createUserInfo(1);

      var createTeamAndUserPromise: Promise<any[]> = Promise.all([
        TeamsDataHandler.createTeam(teamInfo),
        UserDataHandler.createUser(userInfo)
      ]);

      var teamMemberPromise: Promise<TeamMember> =
        createTeamAndUserPromise.then((teamAndUser: any[]) => {
          var team: Team = teamAndUser[0];
          var user: User = teamAndUser[1];

          var teamMemberInfo: ITeamMemberInfo = createTeamMemberInfo(team, user);

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
      userInfo1 = createUserInfo(1);
      userInfo2 = createUserInfo(2);
      userInfo3 = createUserInfo(3);

      teamInfo1 = createTeamInfo('a');
      teamInfo2 = createTeamInfo('b');

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
      var teamMemberInfo1: ITeamMemberInfo = createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = createTeamMemberInfo(team1, user2);

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
      var teamMemberInfo1: ITeamMemberInfo = createTeamMemberInfo(team1, user1);
      teamMemberInfo1.is_admin = true;
      var teamMemberInfo2: ITeamMemberInfo = createTeamMemberInfo(team1, user2);
      teamMemberInfo2.is_admin = false;
      var teamMemberInfo3: ITeamMemberInfo = createTeamMemberInfo(team1, user3);
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
      var teamMemberInfo1: ITeamMemberInfo = createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = createTeamMemberInfo(team1, user2);

      var teamMemberInfo3: ITeamMemberInfo = createTeamMemberInfo(team2, user1);
      var teamMemberInfo4: ITeamMemberInfo = createTeamMemberInfo(team2, user3);

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
      var teamInfo: ITeamInfo = createTeamInfo('a');
      var skillInfo: ISkillInfo = createSkillInfo('skill1');

      var createTeamAndSkillsPromise: Promise<any[]> = Promise.all([
        TeamsDataHandler.createTeam(teamInfo),
        SkillsDataHandler.createSkill(skillInfo)
      ]);

      var teamSkillPromise: Promise<TeamSkill> =
        createTeamAndSkillsPromise.then((teamAndSkill: any[]) => {
          var team: Team = teamAndSkill[0];
          var skill: Skill = teamAndSkill[1];

          var teamSkillInfo: ITeamSkillInfo = createTeamSkillInfo(team, skill);

          return TeamsDataHandler.addTeamSkill(teamSkillInfo);
        });

      // Assert
      return expect(teamSkillPromise).to.eventually.fulfilled;
    });

  });

  describe('getTeamSkills', () => {

    interface ISkillIdToUpvotes {
      skillId: number;
      upvotes: number;
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
          var actualUpvotes: number[] = _.map(orderedActualUsers, _ => _.upvotes);

          var orderedExpectedUpvotes: ISkillIdToUpvotes[] = _.orderBy(expectedSkillIdToUpvotes, _ => _.skillId);
          var expectedUpvotes: number[] = _.map(orderedExpectedUpvotes, _ => _.upvotes);

          expect(actualUpvotes).to.deep.equal(expectedUpvotes);
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

    beforeEach(() => {
      skillInfo1 = createSkillInfo('skill1');
      skillInfo2 = createSkillInfo('skill2');
      skillInfo3 = createSkillInfo('skill3');

      teamInfo1 = createTeamInfo('a');
      teamInfo2 = createTeamInfo('b');

      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        SkillsDataHandler.createSkill(skillInfo3)
      ]).then((teamsAndSkills: any[]) => {
        team1 = teamsAndSkills[0];
        team2 = teamsAndSkills[1];
        skill1 = teamsAndSkills[2];
        skill2 = teamsAndSkills[3];
        skill3 = teamsAndSkills[4];
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
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team1, skill2);

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

    it('should return all existing team skills with correct number of upvotes', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      teamSkillInfo1.upvotes = 11;
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team1, skill2);
      teamSkillInfo2.upvotes = 0;
      var teamSkillInfo3: ITeamSkillInfo = createTeamSkillInfo(team1, skill3);
      teamSkillInfo3.upvotes = 7;

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
        { skillId: teamSkillInfo1.skill_id, upvotes: teamSkillInfo1.upvotes },
        { skillId: teamSkillInfo2.skill_id, upvotes: teamSkillInfo2.upvotes },
        { skillId: teamSkillInfo3.skill_id, upvotes: teamSkillInfo3.upvotes }
      ];
      return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
    });

    it('should return all existing skills and not return other skills', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team1, skill2);

      var teamSkillInfo3: ITeamSkillInfo = createTeamSkillInfo(team2, skill1);
      var teamSkillInfo4: ITeamSkillInfo = createTeamSkillInfo(team2, skill3);

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

  });

});
