import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {GlobalPermissionConverter} from "../enums/globalPermissionConverter";
import {IUserPermissionResponse} from "../apiResponses/iUserPermissionResponse";
import {GlobalPermission} from "../models/enums/globalPermission";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {UserLoginManager} from "../testUtils/userLoginManager";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ExpressServer} from "../expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as supertest from 'supertest';
import {SuperTest, Response} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from '../enums/statusCode';
import {webpackInitializationTimeout} from '../../../testConfigurations';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('usersController', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserRegistrationDefinition;
  var users: User[];
  var usernameSuffix: string;

  before(function(done) {
    this.timeout(webpackInitializationTimeout);

    ExpressServer.instance.initialize()
      .then((_expressServer) => {
        expressServer = _expressServer;

        server = supertest.agent(expressServer.expressApp);

        done();
      });
  });

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);
    return EnvironmentCleaner.clearTables();
  });

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);

    userDefinition = {
      username: 'someUser',
      password: 'somePassword',
      email: 'a@gmail.com',
      firstName: 'first name',
      lastName: 'last name'
    }

    return UserLoginManager.logoutUser(server);
  });

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);

    usernameSuffix = '_usersController';

    return EnvironmentDirtifier.createUsers(5, usernameSuffix)
      .then(() => UserDataHandler.getUsers())
      .then((_users: User[]) => {
        users = _users;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  function getExpectedUsersDetails(users: User[]): IUserInfoResponse[] {
    return _.map(users, (_user: User) => {
      return {
        id: _user.id,
        username: _user.attributes.username
      }
    })
  }

  var notAuthorizedTests = () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    });

    it('getting users details should fail', (done) => {
      server.get('/users')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    describe('get filtered users details by partial username', () => {

      it('should fail', (done) => {
        server.get('/users/filtered/1')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('with maximum number of users should fail', (done) => {
        server.get('/users/filtered/1?max=12')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

    it('checking if not existing user exists should return false', (done) => {
      server.get('/users/notExistingUser/exists')
        .expect(StatusCode.OK)
        .expect({ userExists: false })
        .end(done);
    });

    it('checking if existing user exists should return true', (done) => {
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(123);

      UserDataHandler.createUser(userInfo)
        .then(() => {
          server.get('/users/' + userInfo.username + '/exists')
            .expect(StatusCode.OK)
            .expect({ userExists: true })
            .end(done)
        });
    });

    it('updating user permissions should fail', (done) => {
      server.put('/users/1/permissions')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    describe('get user permissions', () => {

      var user: User;

      beforeEach(() => {
        var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(42);
        return UserDataHandler.createUser(userInfo)
          .then((_user: User) => {
            user = _user;
          });
      });

      afterEach(() => {
        return EnvironmentCleaner.clearTables();
      });

      it('getting not existing user permissions should fail', (done) => {
        server.get('/users/123456/permissions')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('getting existing user permissions should fail', (done) => {
        server.get('/users/' + user.id + '/permissions')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

  };

  var autorizedTests = (signinUserMethod: () => Promise<User>) => {

    return () => {

      var user: User;

      beforeEach(() => {
        return signinUserMethod()
          .then((_user: User) => {
            user = _user;
          });
      });

      it('getting users details should succeed', (done) => {
        var expectedUsers = getExpectedUsersDetails(users).sort((_1, _2) => _1.id - _2.id);

        server.get('/users')
          .expect(StatusCode.OK)
          .expect(expectedUsers)
          .end(done);
      });

      describe('gett filtered users details by partial username', () => {

        it('should return one user', (done) => {
          var usersWith1 = _.filter(users, _ => _.attributes.username.indexOf('1') >= 0);

          var expectedUsers = getExpectedUsersDetails(usersWith1);
          expect(expectedUsers.length > 0).to.be.true;

          server.get('/users/filtered/1')
            .expect(StatusCode.OK)
            .expect(expectedUsers)
            .end(done);
        });

        it('should return all users', (done) => {
          var usersWithUsername = _.filter(users, _ => _.attributes.username.indexOf('username') >= 0);

          var expectedUsers = getExpectedUsersDetails(usersWithUsername);
          expect(expectedUsers.length > 0).to.be.true;

          server.get('/users/filtered/username')
            .expect(StatusCode.OK)
            .expect(expectedUsers)
            .end(done);
        });

        it('with max number of users limit should return one user', (done) => {
          var usersWith1 = _.filter(users, _ => _.attributes.username.indexOf('name1') >= 0);

          var expectedUsers = getExpectedUsersDetails(usersWith1);
          expect(expectedUsers.length).to.be.equal(1);

          server.get('/users/filtered/1?max=12')
            .expect(StatusCode.OK)
            .expect(expectedUsers)
            .end(done);
        });

        it('with max number of users limit should return correct number of users', (done) => {
          var allRelevantUsers = _.filter(users, _ => _.attributes.username.indexOf(usernameSuffix) >= 0);

          var allUsers: IUserInfoResponse[] = getExpectedUsersDetails(allRelevantUsers);

          var maxNumberOfUsers = 2;
          expect(allUsers.length).to.be.greaterThan(maxNumberOfUsers);

          server.get('/users/filtered/' + usernameSuffix + '?max=' + maxNumberOfUsers)
            .expect(StatusCode.OK)
            .end((error: any, response: Response) => {
              var actualUsers: IUserInfoResponse[] = response.body;

              expect(actualUsers).to.be.length(maxNumberOfUsers);

              actualUsers.forEach((_user: IUserInfoResponse) => {
                expect(_user.username).to.contain(usernameSuffix);
              });

              done();
            });
        });

      });

      it('checking if not existing user exists should return false', (done) => {
        server.get('/users/notExistingUser/exists')
          .expect(StatusCode.OK)
          .expect({ userExists: false })
          .end(done);
      });

      it('checking if existing user exists should return true', (done) => {
        server.get('/users/' + userDefinition.username + '/exists')
          .expect(StatusCode.OK)
          .expect({ userExists: true })
          .end(done);
      });

      describe('get user permissions', () => {

        var user: User;
        var permissions: GlobalPermission[];
        var expectedPermissions: IUserPermissionResponse[];

        beforeEach(() => {
          permissions = [
            GlobalPermission.ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN,
            GlobalPermission.READER,
            GlobalPermission.GUEST
          ];

          var permissionsWithoutGuest = _.difference(permissions, [GlobalPermission.GUEST]);

          expectedPermissions =
            _.map(permissionsWithoutGuest, _ => GlobalPermissionConverter.convertToUserPermissionResponse(_))
              .sort((_1, _2) => _1.value - _2.value);

          var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(213);

          return UserDataHandler.createUser(userInfo)
            .then((_user: User) => {
              user = _user;
            })
            .then(() => UserDataHandler.addGlobalPermissions(user.id, permissions));
        });

        it('getting not existing user permissions should succeed with empty permissions', (done) => {
          server.get('/users/123456/permissions')
            .expect(StatusCode.OK)
            .expect([])
            .end(done);
        });

        it('getting existing user permissions should succeed', (done) => {
          server.get('/users/' + user.id + '/permissions')
            .expect(StatusCode.OK)
            .expect(expectedPermissions)
            .end(done);
        });

      });

      describe('update user permissions', () => {

        var userToModifyPermissionsOf: User;
        var permissionsOfUserToModify: GlobalPermission[];

        beforeEach(() => {
          permissionsOfUserToModify = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          var userInfo = ModelInfoMockFactory.createUserInfo(334);

          return UserDataHandler.createUser(userInfo)
            .then((_user: User) => {
              userToModifyPermissionsOf = _user;
            })
            .then(() => UserDataHandler.addGlobalPermissions(userToModifyPermissionsOf.id, permissionsOfUserToModify));
        });

        describe('logged in user has insuffisient permissions to modify the user', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.READER]);
          });

          it('removing permissions should fail', (done) => {
            var userPermissions = {
              permissionsToAdd: [],
              permissionsToRemove: permissionsOfUserToModify
            };

            server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
              .send(userPermissions)
              .expect(StatusCode.UNAUTHORIZED)
              .end(done);
          });

          it('adding permissions should fail', (done) => {
            var userPermissions = {
              permissionsToAdd: [GlobalPermission.TEAMS_LIST_ADMIN],
              permissionsToRemove: []
            };

            server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
              .send(userPermissions)
              .expect(StatusCode.UNAUTHORIZED)
              .end(done);
          });

        });

        describe('logged in user has suffisient permissions to modify the user', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);
          });

          it('removing permissions should succeed', (done) => {
            var userPermissions = {
              permissionsToAdd: [],
              permissionsToRemove: permissionsOfUserToModify
            };

            server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
              .send(userPermissions)
              .expect(StatusCode.OK)
              .end(() => {
                UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                  .then((_actualPermissions: GlobalPermission[]) => {
                    permissionsOfUserToModify.forEach((_permission) => {
                      expect(_actualPermissions).to.not.contain(_permission);
                    })
                    done();
                  });
              });
          });

          it('adding permissions should succeed', (done) => {
            var userPermissions = {
              permissionsToAdd: [GlobalPermission.TEAMS_LIST_ADMIN],
              permissionsToRemove: []
            };

            server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
              .send(userPermissions)
              .expect(StatusCode.OK)
              .end(() => {
                UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                  .then((_actualPermissions: GlobalPermission[]) => {
                    expect(_actualPermissions).to.contain(GlobalPermission.TEAMS_LIST_ADMIN);
                    done();
                  });
              });
          });

          it('removing not existing permission should succeed', (done) => {
            var userPermissions = {
              permissionsToAdd: [],
              permissionsToRemove: [GlobalPermission.ADMIN]
            };

            server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
              .send(userPermissions)
              .expect(StatusCode.OK)
              .end(() => {
                UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                  .then((_actualPermissions: GlobalPermission[]) => {
                    permissionsOfUserToModify.forEach((_permission) => {
                      expect(_actualPermissions).to.not.contain(GlobalPermission.ADMIN);
                    })
                    done();
                  });
              });
          });

          it('adding existing permissions should succeed', (done) => {
            var userPermissions = {
              permissionsToAdd: permissionsOfUserToModify,
              permissionsToRemove: []
            };

            server.put('/users/' + userToModifyPermissionsOf.id + '/permissions')
              .send(userPermissions)
              .expect(StatusCode.OK)
              .end(() => {
                UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id)
                  .then((_actualPermissions: GlobalPermission[]) => {
                    permissionsOfUserToModify.forEach((_permission) => {
                      expect(_actualPermissions).to.contain(_permission);
                    });
                    done();
                  });
              });
          });

        });

      });

      describe('logout', notAuthorizedTests);

    }

  }

  describe('user not logged in', notAuthorizedTests);

  describe('user registered',
    autorizedTests(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
        .then((_user: User) => {
          users.push(_user);

          return _user;
        });
    })
  );

  describe('user logged in',
    autorizedTests(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserLoginManager.logoutUser(server))
        .then(() => UserLoginManager.loginUser(server, userDefinition))
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
        .then((_user: User) => {
          users.push(_user);

          return _user;
        });
    })
  );

});
