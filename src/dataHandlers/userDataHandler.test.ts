import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {IUserGlobalPermissions} from "../models/interfaces/iUserGlobalPermissions";
import {GlobalPermission} from "../models/enums/globalPermission";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised'
import { User, Users} from '../models/user';
import {UserDataHandler} from './userDataHandler';
import {UserGlobalPermissions, UsersGlobalPermissions} from '../models/usersGlobalPermissions';
import {Team, Teams} from '../models/team';
import {TeamMember, TeamMembers} from '../models/teamMember';
import {TeamsDataHandler} from './teamsDataHandler';
import {ITeamOfAUser} from '../models/interfaces/iTeamOfAUser';

chai.use(chaiAsPromised);

describe('userDataHandler', () => {

  function clearTables(): Promise<any> {
    return Promise.all([
      UsersGlobalPermissions.clearAll(),
      TeamMembers.clearAll()
    ]).then(() =>
      Promise.all([
        Users.clearAll(),
        Teams.clearAll()
      ]));
  }

  beforeEach(() => {
    return clearTables();
  });

  afterEach(() => {
    return clearTables();
  });

  function createUserInfo(userNumber: number): IUserInfo {
    var userNumberString = userNumber.toString();

    return {
      username: userNumberString + ' name',
      password_hash: userNumberString + ' password',
      email: userNumberString + '@gmail.com',
      firstName: userNumberString + ' first name',
      lastName: userNumberString + ' last name'
    }
  }

  function verifyUserInfoAsync(actualUserPromise: Promise<User>,
    expectedUserInfo: IUserInfo): Promise<void> {

    return expect(actualUserPromise).to.eventually.fulfilled
      .then((user: User) => {
        verifyUserInfo(user.attributes, expectedUserInfo);
      });
  }

  function verifyUserInfo(actual: IUserInfo, expected: IUserInfo): void {
    var actualCloned: IUserInfo = _.clone(actual);
    var expectedCloned: IUserInfo = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  describe('createUser', () => {

    it('should create user correctly', () => {
      // Act
      var userInfo: IUserInfo = createUserInfo(1);
      var userPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Assert
      return verifyUserInfoAsync(userPromise, userInfo);
    });

  });

  describe('getUser', () => {

    it('no such user should return null', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUser('not existing user');

      // Assert
      return expect(userPromise).to.eventually.null;
    });

    it('user exists should return correct user', () => {
      // Arrange
      var userInfo: IUserInfo = createUserInfo(1);
      var createUserPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Act
      var getUserPromise: Promise<User> =
        createUserPromise.then(() => UserDataHandler.getUser(userInfo.username));

      // Assert
      return verifyUserInfoAsync(getUserPromise, userInfo);
    });

  });

  describe('getUsers', () => {

    function verifyUsersInfoWithoutOrderAsync(actualUsersPromise: Promise<User[]>,
      expectedUsersInfo: IUserInfo[]): Promise<void> {

      return expect(actualUsersPromise).to.eventually.fulfilled
        .then((users: User[]) => {

          var actualUserInfos = _.map(users, _user => _user.attributes);

          verifyUsersInfoWithoutOrder(actualUserInfos, expectedUsersInfo);
        });
    }

    function verifyUsersInfoWithoutOrder(actual: IUserInfo[], expected: IUserInfo[]): void {
      var actualOrdered = _.orderBy(actual, _info => _info.username);
      var expectedOrdered = _.orderBy(expected, _info => _info.username);

      expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

      for (var i = 0; i < expected.length; i++) {
        verifyUserInfo(actualOrdered[i], expectedOrdered[i]);
      }
    }

    it('no users should return empty', () => {
      // Act
      var usersPromose: Promise<User[]> = UserDataHandler.getUsers();

      // Assert
      var expectedUsersInfo: IUserInfo[] = [];
      return verifyUsersInfoWithoutOrderAsync(usersPromose, expectedUsersInfo);
    });

    it('should return all created users', () => {
      // Arrange
      var userInfo1: IUserInfo = createUserInfo(1);
      var userInfo2: IUserInfo = createUserInfo(2);
      var userInfo3: IUserInfo = createUserInfo(3);

      var createAllUsersPromise: Promise<any> =
        Promise.all([
          UserDataHandler.createUser(userInfo1),
          UserDataHandler.createUser(userInfo2),
          UserDataHandler.createUser(userInfo3)
        ]);

      // Act
      var usersPromose: Promise<User[]> =
        createAllUsersPromise.then(() => UserDataHandler.getUsers());

      // Assert
      var expectedUsersInfo: IUserInfo[] = [userInfo1, userInfo2, userInfo3];
      return verifyUsersInfoWithoutOrderAsync(usersPromose, expectedUsersInfo);
    });

  });

  describe('getUserByUsername', () => {

    it('no such user and require is false should succeed with null', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUserByUsername('not existing', false);

      // Assert
      return expect(userPromise).to.eventually.be.null;
    });

    it('no such user and require is true should fail', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUserByUsername('not existing', true);

      // Assert
      return expect(userPromise).to.eventually.rejected;
    });

    it('user exists and require is false should return correct user', () => {
      // Arrange
      var userInfo1: IUserInfo = createUserInfo(1);
      var userInfo2: IUserInfo = createUserInfo(2);
      var userInfo3: IUserInfo = createUserInfo(3);

      var createUsersPromise: Promise<any> =
        Promise.all([
          UserDataHandler.createUser(userInfo1),
          UserDataHandler.createUser(userInfo2),
          UserDataHandler.createUser(userInfo3)
        ]);

      // Act
      var userPromise: Promise<User> =
        createUsersPromise.then(() => UserDataHandler.getUserByUsername(userInfo2.username, false));

      // Assert
      return verifyUserInfoAsync(userPromise, userInfo2);
    });

    it('user exists and require is true should return correct user', () => {
      // Arrange
      var userInfo1: IUserInfo = createUserInfo(1);
      var userInfo2: IUserInfo = createUserInfo(2);
      var userInfo3: IUserInfo = createUserInfo(3);

      var createUsersPromise: Promise<any> =
        Promise.all([
          UserDataHandler.createUser(userInfo1),
          UserDataHandler.createUser(userInfo2),
          UserDataHandler.createUser(userInfo3)
        ]);

      // Act
      var userPromise: Promise<User> =
        createUsersPromise.then(() => UserDataHandler.getUserByUsername(userInfo2.username, true));

      // Assert
      return verifyUserInfoAsync(userPromise, userInfo2);
    });

  });

  describe('getUserGlobalPermissions', () => {

    function verifyUserGlobalPermissionsAsync(actualPermissionsPromise: Promise<GlobalPermission[]>,
      expectedPermissions: GlobalPermission[]): Promise<void> {

      return expect(actualPermissionsPromise).to.eventually.fulfilled
        .then((actualPermissions: GlobalPermission[]) => {
          verifyUserGlobalPermissions(actualPermissions, expectedPermissions);
        });
    }

    function verifyUserGlobalPermissions(actual: GlobalPermission[], expected: GlobalPermission[]): void {
      var actualOrdered: GlobalPermission[] = actual.sort();
      var expectedOrdered: GlobalPermission[] = expected.sort();

      expect(actualOrdered).to.deep.equal(expectedOrdered);
    }

    function addUserPermissions(user: User, permissions: GlobalPermission[]): Promise<any> {
      var permissionPromises: Promise<UserGlobalPermissions>[] = [];

      permissions.forEach((permission: GlobalPermission) => {
        var newPermission: IUserGlobalPermissions = {
          user_id: user.id,
          global_permissions: GlobalPermission[permission]
        }

        var newPermissionPromise: Promise<UserGlobalPermissions> =
          new UserGlobalPermissions(newPermission).save();

        permissionPromises.push(newPermissionPromise);
      });

      return Promise.all(permissionPromises);
    }

    it('no such user should return empty permissions list', () => {
      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        UserDataHandler.getUserGlobalPermissions('not existing username');

      // Assert
      var expectedPermissions: GlobalPermission[] = [];
      return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
    });

    it('user exists but has no permissions should return empty permissions list', () => {
      // Assert
      var userInfo: IUserInfo = createUserInfo(1);

      var createUserPromise: Promise<User> = UserDataHandler.createUser(userInfo);

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        createUserPromise.then(() => UserDataHandler.getUserGlobalPermissions(userInfo.username));

      // Assert
      var expectedPermissions: GlobalPermission[] = [];
      return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
    });

    it('user exists with permissions should return correct permissions list', () => {
      // Assert
      var userInfo: IUserInfo = createUserInfo(1);
      var permissions: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var createUserPromise: Promise<User> = UserDataHandler.createUser(userInfo);
      var addUserPermissionsPromise: Promise<void> =
        createUserPromise.then((user: User) => addUserPermissions(user, permissions));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        createUserPromise.then(() => UserDataHandler.getUserGlobalPermissions(userInfo.username));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions);
    });

    it('multiple users exist with permissions should return correct permissions list', () => {
      // Assert
      var userInfo1: IUserInfo = createUserInfo(1);
      var userInfo2: IUserInfo = createUserInfo(2);
      var permissions1: GlobalPermission[] =
        [
          GlobalPermission.READER,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];
      var permissions2: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var createUserPromise1: Promise<User> = UserDataHandler.createUser(userInfo1);
      var createUserPromise2: Promise<User> = UserDataHandler.createUser(userInfo2);
      var addUserPermissionsPromise1: Promise<void> =
        createUserPromise1.then((user: User) => addUserPermissions(user, permissions1));
      var addUserPermissionsPromise2: Promise<void> =
        createUserPromise2.then((user: User) => addUserPermissions(user, permissions2));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
          .then(() => UserDataHandler.getUserGlobalPermissions(userInfo1.username));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions1);
    });

    it('multiple users exist with permissions should return correct permissions list 2', () => {
      // Assert
      var userInfo1: IUserInfo = createUserInfo(1);
      var userInfo2: IUserInfo = createUserInfo(2);
      var permissions1: GlobalPermission[] =
        [
          GlobalPermission.READER,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];
      var permissions2: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var createUserPromise1: Promise<User> = UserDataHandler.createUser(userInfo1);
      var createUserPromise2: Promise<User> = UserDataHandler.createUser(userInfo2);
      var addUserPermissionsPromise1: Promise<void> =
        createUserPromise1.then((user: User) => addUserPermissions(user, permissions1));
      var addUserPermissionsPromise2: Promise<void> =
        createUserPromise2.then((user: User) => addUserPermissions(user, permissions2));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
          .then(() => UserDataHandler.getUserGlobalPermissions(userInfo2.username));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions2);
    });

  });

  describe('getTeams', () => {

    interface ITeamIdToIsAdmin {
      teamId: number;
      isAdmin: boolean;
    }

    function verifyTeamsAsync(actualTeamsPromise: Promise<ITeamOfAUser[]>,
      expectedTeams: ITeamInfo[]): Promise<void> {

      return expect(actualTeamsPromise).to.eventually.fulfilled
        .then((actualTeams: ITeamOfAUser[]) => {
          var actualTeamInfos: ITeamInfo[] = _.map(actualTeams, _ => _.team.attributes);

          verifyTeams(actualTeamInfos, expectedTeams);
        });
    }

    function verifyTeams(actual: ITeamInfo[], expected: ITeamInfo[]): void {
      var actualOrdered: ITeamInfo[] = _.orderBy(actual, _ => _.name);
      var expectedOrdered: ITeamInfo[] = _.orderBy(expected, _ => _.name);

      expect(actual.length).to.be.equal(expected.length);

      for (var i = 0; i < expected.length; i++) {
        verifyTeam(actualOrdered[i], expectedOrdered[i]);
      }
    }

    function verifyTeam(actual: ITeamInfo, expected: ITeamInfo): void {
      var actualCloned: ITeamInfo = _.clone(actual);
      var expectedCloned: ITeamInfo = _.clone(expected);

      delete actualCloned['id'];
      delete expectedCloned['id'];

      expect(actualCloned).to.be.deep.equal(expectedCloned);
    }

    function createTeamInfo(teamName: string): ITeamInfo {
      return {
        name: teamName
      };
    }

    function createTeamMemberInfo(team: Team, user: User): ITeamMemberInfo {
      return {
        team_id: team.id,
        user_id: user.id,
        is_admin: false
      }
    }

    function verifyTeamAdminSettingsAsync(actualUserTeamsPromise: Promise<ITeamOfAUser[]>,
      expectedAdminSettings: ITeamIdToIsAdmin[]): Promise<void> {

      return expect(actualUserTeamsPromise).to.eventually.fulfilled
        .then((actualTeams: ITeamOfAUser[]) => {
          var orderedActualTeams: ITeamOfAUser[] = _.orderBy(actualTeams, _ => _.team.attributes.name);
          var actualIsAdmin: boolean[] = _.map(orderedActualTeams, _ => _.isAdmin);

          var orderedExpectedAdminSettings: ITeamIdToIsAdmin[] = _.orderBy(expectedAdminSettings, _ => _.teamId);
          var expectedIsAdmin: boolean[] = _.map(orderedExpectedAdminSettings, _ => _.isAdmin);

          expect(actualIsAdmin).to.deep.equal(expectedIsAdmin);
        });
    }

    var teamInfo1: ITeamInfo;
    var teamInfo2: ITeamInfo;
    var teamInfo3: ITeamInfo;
    var userInfo1: IUserInfo;
    var userInfo2: IUserInfo;

    var team1: Team;
    var team2: Team;
    var team3: Team;
    var user1: User;
    var user2: User;

    beforeEach(() => {
      teamInfo1 = createTeamInfo('a');
      teamInfo2 = createTeamInfo('b');
      teamInfo3 = createTeamInfo('c');

      userInfo1 = createUserInfo(1);
      userInfo2 = createUserInfo(2);

      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        TeamsDataHandler.createTeam(teamInfo3),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ]).then((teamsAndUser: any[]) => {
        team1 = teamsAndUser[0];
        team2 = teamsAndUser[1];
        team3 = teamsAndUser[2];
        user1 = teamsAndUser[3];
        user2 = teamsAndUser[4];
      });
    });

    it('no such user should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        UserDataHandler.getTeams('not existing username');

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('user exists but has no teams should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        UserDataHandler.getTeams(userInfo1.username);

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('user exists with teams should return correct teams', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = createTeamMemberInfo(team2, user1);

      // Assert
      var addTeamsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        addTeamsPromise.then(() => UserDataHandler.getTeams(userInfo1.username));

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return verifyTeamsAsync(teamsPromise, expectedTeams);
    });

    it('user exists with teams should return correct admin settings', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = createTeamMemberInfo(team1, user1);
      teamMemberInfo1.is_admin = true;
      var teamMemberInfo2: ITeamMemberInfo = createTeamMemberInfo(team2, user1);
      teamMemberInfo2.is_admin = false;
      var teamMemberInfo3: ITeamMemberInfo = createTeamMemberInfo(team3, user1);
      teamMemberInfo3.is_admin = true;

      // Assert
      var addTeamsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2),
          TeamsDataHandler.addTeamMember(teamMemberInfo3)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        addTeamsPromise.then(() => UserDataHandler.getTeams(userInfo1.username));

      // Assert
      var expectedTeamAdminSettings: ITeamIdToIsAdmin[] =
        [
          { teamId: teamMemberInfo1.team_id, isAdmin: teamMemberInfo1.is_admin },
          { teamId: teamMemberInfo2.team_id, isAdmin: teamMemberInfo2.is_admin },
          { teamId: teamMemberInfo3.team_id, isAdmin: teamMemberInfo3.is_admin }
        ];
      return verifyTeamAdminSettingsAsync(teamsPromise, expectedTeamAdminSettings);
    });

    it('multiple users exist with teams should return correct teams', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = createTeamMemberInfo(team2, user1);

      var teamMemberInfo3: ITeamMemberInfo = createTeamMemberInfo(team1, user2);

      // Assert
      var addTeamsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2),
          TeamsDataHandler.addTeamMember(teamMemberInfo3)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        addTeamsPromise.then(() => UserDataHandler.getTeams(userInfo1.username));

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return verifyTeamsAsync(teamsPromise, expectedTeams);
    });

  });

});
