import {TeamCreator} from "../models/teamCreator";
import {SkillCreator} from "../models/skillCreator";
import {SkillsDataHandler} from "./skillsDataHandler";
import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
import {TeamSkillUpvote, TeamSkillUpvotes} from "../models/teamSkillUpvote";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {ITestModels} from "../testUtils/interfaces/iTestModels";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoComparers} from "../testUtils/modelInfoComparers";
import {ModelVerificator} from "../testUtils/modelVerificator";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {IUserGlobalPermissions} from "../models/interfaces/iUserGlobalPermissions";
import {GlobalPermission} from "../models/enums/globalPermission";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import {bookshelf} from '../../../bookshelf';
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
import {Transaction} from 'knex';

chai.use(chaiAsPromised);

describe('userDataHandler', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

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

  describe('createUser', () => {

    it('should create user correctly', () => {
      // Act
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var userPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Assert
      return ModelVerificator.verifyModelInfoAsync(userPromise, userInfo);
    });

  });

  describe('createUserWithPermissions', () => {

    it('should create user correctly', () => {
      // Act
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var globalPermissions: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var userPromise: Promise<User> =
        UserDataHandler.createUserWithPermissions(userInfo, globalPermissions);

      // Assert
      return ModelVerificator.verifyModelInfoAsync(userPromise, userInfo);
    });

    it('should set the user permissions correctly', () => {
      // Act
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var expectedPermissions: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var userPromise: Promise<User> =
        UserDataHandler.createUserWithPermissions(userInfo, expectedPermissions);

      // Assert
      return expect(userPromise).to.eventually.fulfilled
        .then((_user: User) => UserDataHandler.getUserGlobalPermissions(_user.id))
        .then((_actualPermissions: GlobalPermission[]) => {
          expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
        });
    });

  });

  describe('deleteUser', () => {

    var testModels: ITestModels;

    beforeEach(() => {
      return EnvironmentDirtifier.fillAllTables()
        .then((_testModels: ITestModels) => {
          testModels = _testModels;
        })
    })

    it('not existing user should not fail', () => {
      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(9999);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing user should not fail', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('existing user should remove the user', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => UserDataHandler.getUsers())
        .then((_users: User[]) => {
          return _.map(_users, _ => _.id);
        })
        .then((_userIds: number[]) => {
          expect(_userIds).not.to.contain(userToDelete.id);
        })
    });

    it('existing user should remove the relevant user global permissions', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new UsersGlobalPermissions().fetch())
        .then((_permissionsCollection: Collection<UserGlobalPermissions>) => {
          return _permissionsCollection.toArray();
        })
        .then((_permissions: UserGlobalPermissions[]) => {
          return _.map(_permissions, _ => _.attributes.user_id);
        })
        .then((_userIds: number[]) => {
          expect(_userIds).not.to.contain(userToDelete.id);
        });
    });

    it('existing user should remove the relevant team members', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamMembers().fetch())
        .then((_teamMembersCollection: Collection<TeamMember>) => {
          return _teamMembersCollection.toArray();
        })
        .then((_teamMembers: TeamMember[]) => {
          return _.map(_teamMembers, _ => _.attributes.user_id);
        })
        .then((_userIds: number[]) => {
          expect(_userIds).not.to.contain(userToDelete.id);
        });
    });

    it('existing user should remove the relevant team skill upvotes', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => new TeamSkillUpvotes().fetch())
        .then((_upvotesCollection: Collection<TeamSkillUpvote>) => {
          return _upvotesCollection.toArray();
        })
        .then((_upvotes: TeamSkillUpvote[]) => {
          return _.map(_upvotes, _ => _.attributes.user_id);
        })
        .then((_userIds: number[]) => {
          expect(_userIds).not.to.contain(userToDelete.id);
        });
    });

    it('existing user should remove the relevant skill creators', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => SkillsDataHandler.getSkillsCreators())
        .then((_skillsCreators: SkillCreator[]) => {
          return _.map(_skillsCreators, _ => _.attributes.user_id);
        })
        .then((_userIds: number[]) => {
          expect(_userIds).not.to.contain(userToDelete.id);
        });
    });

    it('existing user should remove the relevant team creators', () => {
      // Arrange
      var userToDelete: User = testModels.users[0];

      // Act
      var promise: Promise<User> =
        UserDataHandler.deleteUser(userToDelete.id);

      // Assert
      return expect(promise).to.eventually.fulfilled
        .then(() => TeamsDataHandler.getTeamsCreators())
        .then((_teamsCreators: TeamCreator[]) => {
          return _.map(_teamsCreators, _ => _.attributes.user_id);
        })
        .then((_userIds: number[]) => {
          expect(_userIds).not.to.contain(userToDelete.id);
        });
    });

  });

  describe('getUser', () => {

    it('no such user should return null', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUser(99999);

      // Assert
      return expect(userPromise).to.eventually.null;
    });

    it('user exists should return correct user', () => {
      // Arrange
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var createUserPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Act
      var getUserPromise: Promise<User> =
        createUserPromise.then((user: User) => UserDataHandler.getUser(user.id));

      // Assert
      return ModelVerificator.verifyModelInfoAsync(getUserPromise, userInfo);
    });

  });

  describe('getUserByUsername', () => {

    it('no such user should return null', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUserByUsername('not existing username');

      // Assert
      return expect(userPromise).to.eventually.null;
    });

    it('user exists should return correct user', () => {
      // Arrange
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var createUserPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Act
      var getUserPromise: Promise<User> =
        createUserPromise.then((user: User) => UserDataHandler.getUserByUsername(userInfo.username));

      // Assert
      return ModelVerificator.verifyModelInfoAsync(getUserPromise, userInfo);
    });

  });

  describe('getUserByEmail', () => {

    it('no such user should return null', () => {
      // Act
      var userPromise: Promise<User> =
        UserDataHandler.getUserByEmail('notExisting@email.com');

      // Assert
      return expect(userPromise).to.eventually.null;
    });

    it('user exists should return correct user', () => {
      // Arrange
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var createUserPromise: Promise<User> =
        UserDataHandler.createUser(userInfo);

      // Act
      var getUserPromise: Promise<User> =
        createUserPromise.then((user: User) => UserDataHandler.getUserByEmail(userInfo.email));

      // Assert
      return ModelVerificator.verifyModelInfoAsync(getUserPromise, userInfo);
    });

  });

  describe('getUsers', () => {

    it('no users should return empty', () => {
      // Act
      var usersPromose: Promise<User[]> = UserDataHandler.getUsers();

      // Assert
      var expectedUsersInfo: IUserInfo[] = [];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromose,
        expectedUsersInfo,
        ModelInfoComparers.compareUserInfos);
    });

    it('should return all created users', () => {
      // Arrange
      var userInfo1: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var userInfo2: IUserInfo = ModelInfoMockFactory.createUserInfo(2);
      var userInfo3: IUserInfo = ModelInfoMockFactory.createUserInfo(3);

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
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromose,
        expectedUsersInfo,
        ModelInfoComparers.compareUserInfos);
    });

  });

  describe('getUserGlobalPermissions', () => {

    it('no such user should return empty permissions list', () => {
      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        UserDataHandler.getUserGlobalPermissions(999999);

      // Assert
      var expectedPermissions: GlobalPermission[] = [];
      return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
    });

    it('user exists but has no permissions should return empty permissions list', () => {
      // Assert
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);

      var createUserPromise: Promise<User> = UserDataHandler.createUser(userInfo);

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        createUserPromise.then((user: User) => UserDataHandler.getUserGlobalPermissions(user.id));

      // Assert
      var expectedPermissions: GlobalPermission[] = [];
      return verifyUserGlobalPermissionsAsync(permissionsPromise, expectedPermissions);
    });

    it('user exists with permissions should return correct permissions list', () => {
      // Assert
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var permissions: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      var user: User;
      var createUserPromise: Promise<User> =
        UserDataHandler.createUser(userInfo)
          .then((_user: User) => {
            user = _user;
            return _user;
          });

      var addUserPermissionsPromise: Promise<any> =
        createUserPromise.then(() =>
          UserDataHandler.addGlobalPermissions(user.id, permissions));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        addUserPermissionsPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions);
    });

    it('multiple users exist with permissions should return correct permissions list', () => {
      // Assert
      var userInfo1: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var userInfo2: IUserInfo = ModelInfoMockFactory.createUserInfo(2);
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

      var user1: User;
      var addUserPermissionsPromise1: Promise<any> =
        createUserPromise1.then((user: User) => {
          user1 = user;
          return UserDataHandler.addGlobalPermissions(user.id, permissions1);
        });
      var addUserPermissionsPromise2: Promise<any> =
        createUserPromise2.then((user: User) => UserDataHandler.addGlobalPermissions(user.id, permissions2));

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
          .then(() => UserDataHandler.getUserGlobalPermissions(user1.id));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions1);
    });

    it('multiple users exist with permissions should return correct permissions list 2', () => {
      // Assert
      var userInfo1: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
      var userInfo2: IUserInfo = ModelInfoMockFactory.createUserInfo(2);
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
      var addUserPermissionsPromise1: Promise<any> =
        createUserPromise1.then((user: User) => UserDataHandler.addGlobalPermissions(user.id, permissions1));

      var user2: User;
      var addUserPermissionsPromise2: Promise<any> =
        createUserPromise2.then((user: User) => {
          user2 = user;
          return UserDataHandler.addGlobalPermissions(user.id, permissions2);
        });

      // Act
      var permissionsPromise: Promise<GlobalPermission[]> =
        Promise.all([addUserPermissionsPromise1, addUserPermissionsPromise2])
          .then(() => UserDataHandler.getUserGlobalPermissions(user2.id));

      // Assert
      return verifyUserGlobalPermissionsAsync(permissionsPromise, permissions2);
    });

  });

  describe('getTeams', () => {

    interface ITeamIdToIsAdmin {
      teamId: number;
      isAdmin: boolean;
    }

    function verifyTeamAdminSettingsAsync(actualUserTeamsPromise: Promise<ITeamOfAUser[]>,
      expectedAdminSettings: ITeamIdToIsAdmin[]): Promise<void> {

      return expect(actualUserTeamsPromise).to.eventually.fulfilled
        .then((actualTeams: ITeamOfAUser[]) => {
          var orderedActualTeams: ITeamOfAUser[] = _.orderBy(actualTeams, _ => _.team.id);
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
      teamInfo1 = ModelInfoMockFactory.createTeamInfo('a');
      teamInfo2 = ModelInfoMockFactory.createTeamInfo('b');
      teamInfo3 = ModelInfoMockFactory.createTeamInfo('c');

      userInfo1 = ModelInfoMockFactory.createUserInfo(1);
      userInfo2 = ModelInfoMockFactory.createUserInfo(2);

      return Promise.all<any>([
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ])
        .then((_users: User[]) => {
          [user1, user2] = _users;
        })
        .then(() => Promise.all<any>([
          TeamsDataHandler.createTeam(teamInfo1, user1.id),
          TeamsDataHandler.createTeam(teamInfo2, user1.id),
          TeamsDataHandler.createTeam(teamInfo3, user1.id)
        ])).then((_teams: Team[]) => {
          [team1, team2, team3] = _teams;
        });
    });

    it('no such user should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        UserDataHandler.getTeams(999999);

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('user exists but has no teams should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfAUser[]> =
        UserDataHandler.getTeams(user1.id);

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('user exists with teams should return correct teams', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team2, user1);

      // Assert
      var addTeamsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2)
        ]);

      // Act
      var teamsPromise: Promise<Team[]> =
        addTeamsPromise.then(() => UserDataHandler.getTeams(user1.id))
          .then((teamsOfAUser: ITeamOfAUser[]) => {
            return _.map(teamsOfAUser, _ => _.team);
          });

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise,
        expectedTeams,
        ModelInfoComparers.compareTeamInfos);
    });

    it('user exists with teams should return correct admin settings', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo1.is_admin = true;
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
      teamMemberInfo2.is_admin = false;
      var teamMemberInfo3: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team3, user1);
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
        addTeamsPromise.then(() => UserDataHandler.getTeams(user1.id));

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
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team2, user1);

      var teamMemberInfo3: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user2);

      // Assert
      var addTeamsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamMember(teamMemberInfo1),
          TeamsDataHandler.addTeamMember(teamMemberInfo2),
          TeamsDataHandler.addTeamMember(teamMemberInfo3)
        ]);

      // Act
      var teamsPromise: Promise<Team[]> =
        addTeamsPromise.then(() => UserDataHandler.getTeams(user1.id))
          .then((teamsOfAUser: ITeamOfAUser[]) => {
            return _.map(teamsOfAUser, _ => _.team);
          });

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamsPromise,
        expectedTeams,
        ModelInfoComparers.compareTeamInfos);
    });

  });

  describe('addGlobalPermissions', () => {

    var userInfo: IUserInfo;
    var user: User;

    beforeEach(() => {
      userInfo = ModelInfoMockFactory.createUserInfo(1);

      return UserDataHandler.createUser(userInfo)
        .then((_user: User) => {
          user = _user;
        });
    });

    it('adding should add to permissions', () => {
      // Arrange
      var permissionsToAdd =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd);

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        addPermissionPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, permissionsToAdd);
    });

    it('adding permissions with same permission appearing multiple times should add only once', () => {
      // Arrange
      var permissionsToAdd =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.ADMIN,
          GlobalPermission.ADMIN,
          GlobalPermission.READER,
          GlobalPermission.READER,
          GlobalPermission.READER,
          GlobalPermission.READER
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd);

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        addPermissionPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      var expectedPermissions =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];
      return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
    });

    it('adding same permissions should add to permissions only once', () => {
      // Arrange
      var permissionsToAdd =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd)
          .then(() => UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd));

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        addPermissionPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, permissionsToAdd);
    });

    it('adding existing permissions should succeed', () => {
      // Arrange
      var permissionsToAdd =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd)
          .then(() => UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd));

      // Assert
      return expect(addPermissionPromise).to.eventually.fulfilled;
    });

    it('adding to not existing user should fail', () => {
      // Arrange
      var permissionsToAdd =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(999999, permissionsToAdd);

      // Assert
      return expect(addPermissionPromise).to.eventually.rejected;
    });

    it('adding new permissions should add to permissions', () => {
      // Arrange
      var existingPermissions =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      var existingPermissionsPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, existingPermissions);

      var permissionsToAdd =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        existingPermissionsPromise
          .then(() => UserDataHandler.addGlobalPermissions(user.id, permissionsToAdd));

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        addPermissionPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      var expectedPermissions: GlobalPermission[] = _.union(existingPermissions, permissionsToAdd);
      return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
    });

  });

  describe('removeGlobalPermissions', () => {

    var userInfo: IUserInfo;
    var user: User;

    beforeEach(() => {
      userInfo = ModelInfoMockFactory.createUserInfo(1);

      return UserDataHandler.createUser(userInfo)
        .then((_user: User) => {
          user = _user;
        });
    });

    it('removing from user without permissions should succeed', () => {
      // Arrange
      var permissionsToRemove =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var removePermissionsPromise: Promise<any> =
        UserDataHandler.removeGlobalPermissions(user.id, permissionsToRemove);

      // Assert
      return expect(removePermissionsPromise).to.eventually.fulfilled;
    });

    it('removing all permissions should leave no permissions', () => {
      // Arrange
      var existingPermissions =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      var existingPermissionsPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, existingPermissions);

      // Act
      var removePermissionsPromise: Promise<any> =
        existingPermissionsPromise
          .then(() => UserDataHandler.removeGlobalPermissions(user.id, existingPermissions));

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        removePermissionsPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      return expect(actualPermissionsPromise).to.eventually.deep.equal([]);
    });

    it('removing some permissions should leave other permissions', () => {
      // Arrange
      var existingPermissions =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.GUEST
        ];

      var existingPermissionsPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, existingPermissions);

      var permissionsToRemove =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

      // Act
      var removePermissionsPromise: Promise<any> =
        existingPermissionsPromise
          .then(() => UserDataHandler.removeGlobalPermissions(user.id, permissionsToRemove));

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        removePermissionsPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      var expectedPermissions =
        [
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];
      return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
    });

    it('removing permissions that appear multiple times should remove correctly', () => {
      // Arrange
      var existingPermissions =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.GUEST
        ];

      var existingPermissionsPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, existingPermissions);

      var permissionsToRemove =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.ADMIN,
          GlobalPermission.ADMIN,
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

      // Act
      var removePermissionsPromise: Promise<any> =
        existingPermissionsPromise
          .then(() => UserDataHandler.removeGlobalPermissions(user.id, permissionsToRemove));

      // Assert
      var actualPermissionsPromise: Promise<GlobalPermission[]> =
        removePermissionsPromise.then(() => UserDataHandler.getUserGlobalPermissions(user.id));

      var expectedPermissions =
        [
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];
      return verifyUserGlobalPermissionsAsync(actualPermissionsPromise, expectedPermissions);
    });

    it('removing from not existing user should not fail', () => {
      // Arrange
      var permissionsToRemove =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.READER
        ];

      // Act
      var addPermissionPromise: Promise<any> =
        UserDataHandler.removeGlobalPermissions(999999, permissionsToRemove);

      // Assert
      return expect(addPermissionPromise).to.eventually.fulfilled;
    });

  });

  describe('updateUserDetails', () => {

    it('should update the user details correctly', () => {
      // Arrange
      var user: User;
      var newUserInfo: IUserInfo
      var createUserPromise: Promise<void> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => {
            [user] = _users;

            newUserInfo = {
              id: user.id,
              username: user.attributes.username + ' new username',
              password_hash: user.attributes.password_hash,
              email: 'newMail' + user.attributes.email,
              firstName: user.attributes.firstName + ' new first name',
              lastName: user.attributes.lastName + ' new last name'
            }
          });

      // Act
      var updateUserDetailsPromise: Promise<User> =
        createUserPromise.then(() =>
          UserDataHandler.updateUserDetails(user.id,
            newUserInfo.username,
            newUserInfo.email,
            newUserInfo.firstName,
            newUserInfo.lastName));

      // Assert
      return expect(updateUserDetailsPromise).to.eventually.fulfilled
        .then(() => UserDataHandler.getUser(user.id))
        .then((_user: User) => {
          ModelInfoVerificator.verifyInfo(_user.attributes, newUserInfo);
        })
    });

    it('with undefined email should update the user details correctly', () => {
      // Arrange
      var user: User;
      var newUserInfo: IUserInfo
      var createUserPromise: Promise<void> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => {
            [user] = _users;

            newUserInfo = {
              id: user.id,
              username: user.attributes.username + ' new username',
              password_hash: user.attributes.password_hash,
              email: undefined,
              firstName: user.attributes.firstName + ' new first name',
              lastName: user.attributes.lastName + ' new last name'
            }
          });

      // Act
      var updateUserDetailsPromise: Promise<User> =
        createUserPromise.then(() =>
          UserDataHandler.updateUserDetails(user.id,
            newUserInfo.username,
            newUserInfo.email,
            newUserInfo.firstName,
            newUserInfo.lastName));

      // Assert
      return expect(updateUserDetailsPromise).to.eventually.fulfilled
        .then(() => UserDataHandler.getUser(user.id))
        .then((_user: User) => {
          newUserInfo.email = null;
          ModelInfoVerificator.verifyInfo(_user.attributes, newUserInfo);
        })
    });

  });

});
