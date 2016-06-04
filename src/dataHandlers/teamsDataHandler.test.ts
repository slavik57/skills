import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised';
import {ITeamInfo, Team, Teams} from '../models/team';
import {ITeamMemberInfo, TeamMember, TeamMembers} from '../models/teamMember';
import {IUserInfo, User, Users} from '../models/user';
import {TeamsDataHandler} from './teamsDataHandler';
import {UserDataHandler} from './userDataHandler';

chai.use(chaiAsPromised);

describe('TeamsDataHandler', () => {

  function clearTables(): Promise<any> {
    return TeamMembers.clearAll()
      .then(() => Promise.all([
        Teams.clearAll(),
        Users.clearAll()
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
      user_id: user.id
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

    function verifyUsersInfoWithoutOrderAsync(actualUsersPromise: Promise<User[]>,
      expectedUsersInfo: IUserInfo[]): Promise<void> {

      return expect(actualUsersPromise).to.eventually.fulfilled
        .then((users: User[]) => {

          var actualUserInfos: IUserInfo[] = _.map(users, _ => _.attributes);

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
      var teamMembersPromise: Promise<User[]> =
        TeamsDataHandler.getTeamMembers('not existing team');

      // Assert
      var expectedInfo: IUserInfo[] = [];
      return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedInfo);
    });

    it('no team members should return empty', () => {
      // Act
      var teamMembersPromise: Promise<User[]> =
        TeamsDataHandler.getTeamMembers(teamInfo1.name);

      // Assert
      var expectedInfo: IUserInfo[] = [];
      return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedInfo);
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
      var teamMembersPromise: Promise<User[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(teamInfo1.name));

      // Assert
      var expectedSkillsInfos: IUserInfo[] = [userInfo1, userInfo2];
      return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedSkillsInfos);
    });

    it('should return all existing skill prerequisites and not return other prerequisites', () => {
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
      var teamMembersPromise: Promise<User[]> =
        createAllTeamMembersPromise.then(() => TeamsDataHandler.getTeamMembers(teamInfo1.name));

      // Assert
      var expectedSkillsInfos: IUserInfo[] = [userInfo1, userInfo2];
      return verifyUsersInfoWithoutOrderAsync(teamMembersPromise, expectedSkillsInfos);
    });

  });

});
