import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {EnumValues} from "enum-values";
import {IUserPermissionRuleResponse} from "../apiResponses/iUserPermissionRuleResponse";
import {GlobalPermissionConverter} from "../enums/globalPermissionConverter";
import {IUserPermissionResponse} from "../apiResponses/iUserPermissionResponse";
import {GlobalPermission} from '../models/enums/globalPermission';
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {IUserLoginInfoResponse} from "../apiResponses/iUserLoginInfoResponse";
import {UserLoginManager} from "../testUtils/userLoginManager";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ExpressServer} from "../expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as supertest from 'supertest';
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from '../enums/statusCode';
import {webpackInitializationTimeout} from '../../../testConfigurations';
import * as passwordHash from 'password-hash';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('userController', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserRegistrationDefinition;

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

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  function getExpectedUserDetails(user: User): any {
    return {
      id: user.id,
      username: user.attributes.username,
      firstName: user.attributes.firstName,
      lastName: user.attributes.lastName,
      email: user.attributes.email
    }
  }

  var notAuthorizedTests = () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    });

    it('getting user details should fail', (done) => {
      server.get('/user')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('checking if not existing user exists should return false', (done) => {
      server.get('/user/notExistingUser/exists')
        .expect(StatusCode.OK)
        .expect({ userExists: false })
        .end(done);
    });

    it('checking if existing user exists should return true', (done) => {
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(123);

      UserDataHandler.createUser(userInfo)
        .then(() => {
          server.get('/user/' + userInfo.username + '/exists')
            .expect(StatusCode.OK)
            .expect({ userExists: true })
            .end(done)
        });
    });

    it('updating user details should fail', (done) => {
      server.put('/user/1')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('updating user password should fail', (done) => {
      server.put('/user/1/password')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('getting permissions modification rules should fail', (done) => {
      server.get('/user/permissions-modification-rules')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    describe('get user permissions', () => {

      var user: User;

      beforeEach(() => {
        return EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => {
            [user] = _users;
          });
      });

      afterEach(() => {
        return EnvironmentCleaner.clearTables();
      });

      it('getting not existing user permissions should fail', (done) => {
        server.get('/user/123456/permissions')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('getting existing user permissions should fail', (done) => {
        server.get('/user/' + user.id + '/permissions')
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

      it('getting user details should succeed', (done) => {
        var expectedUser = getExpectedUserDetails(user);

        server.get('/user')
          .expect(StatusCode.OK)
          .expect(expectedUser)
          .end(done);
      });

      it('checking if not existing user exists should return false', (done) => {
        server.get('/user/notExistingUser/exists')
          .expect(StatusCode.OK)
          .expect({ userExists: false })
          .end(done);
      });

      it('checking if existing user exists should return true', (done) => {
        server.get('/user/' + userDefinition.username + '/exists')
          .expect(StatusCode.OK)
          .expect({ userExists: true })
          .end(done);
      });

      it('updating user details should succeed and update the user details', (done) => {
        var newUserDetails = {
          username: 'new user',
          email: 'new@gmail.com',
          firstName: 'new first name',
          lastName: 'new last name'
        };

        var expectedUserInfo: IUserInfo = {
          username: newUserDetails.username,
          password_hash: user.attributes.password_hash,
          email: newUserDetails.email,
          firstName: newUserDetails.firstName,
          lastName: newUserDetails.lastName
        }

        server.put('/user/' + user.id)
          .send(newUserDetails)
          .expect(StatusCode.OK)
          .end(() => {
            UserDataHandler.getUser(user.id)
              .then((_user: User) => {
                ModelInfoVerificator.verifyInfo(_user.attributes, expectedUserInfo);
                done();
              });
          });
      });

      it('updating other user details should fail', (done) => {
        server.put('/user/' + (user.id + 1))
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('updating user password should succeed and update the user password correctly', (done) => {
        var newUserPassword = {
          password: userDefinition.password,
          newPassword: 'some new password'
        };

        server.put('/user/' + user.id + '/password')
          .send(newUserPassword)
          .expect(StatusCode.OK)
          .end(() => {
            UserDataHandler.getUser(user.id)
              .then((_user: User) => {
                expect(passwordHash.verify(newUserPassword.newPassword, _user.attributes.password_hash));
                done();
              });
          });
      });

      it('updating other user password should fail', (done) => {
        server.put('/user/' + (user.id + 1) + '/password')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('updating user password with empty password should fail', (done) => {
        var newUserPassword = {
          password: '',
          newPassword: 'some new password'
        };

        server.put('/user/' + user.id + '/password')
          .send(newUserPassword)
          .expect(StatusCode.UNAUTHORIZED)
          .expect({ error: 'Wrong password' })
          .end(done);
      });

      it('updating user password with wrong password should fail', (done) => {
        var newUserPassword = {
          password: 'wrong password',
          newPassword: 'some new password'
        };

        server.put('/user/' + user.id + '/password')
          .send(newUserPassword)
          .expect(StatusCode.UNAUTHORIZED)
          .expect({ error: 'Wrong password' })
          .end(done);
      });

      it('updating user password with empty newPassword should fail', (done) => {
        var newUserPassword = {
          password: userDefinition.password,
          newPassword: ''
        };

        server.put('/user/' + user.id + '/password')
          .send(newUserPassword)
          .expect(StatusCode.BAD_REQUEST)
          .expect({ error: 'The new password cannot be empty' })
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
            GlobalPermission.READER
          ];

          expectedPermissions =
            _.map(permissions, _ => GlobalPermissionConverter.convertToUserPermissionResponse(_))
              .sort((_1, _2) => _1.value - _2.value);

          return EnvironmentDirtifier.createUsers(1)
            .then((_users: User[]) => {
              [user] = _users;
            })
            .then(() => UserDataHandler.addGlobalPermissions(user.id, permissions));
        });

        it('getting not existing user permissions should succeed with empty permissions', (done) => {
          server.get('/user/123456/permissions')
            .expect(StatusCode.OK)
            .expect([])
            .end(done);
        });

        it('getting existing user permissions should succeed', (done) => {
          server.get('/user/' + user.id + '/permissions')
            .expect(StatusCode.OK)
            .expect(expectedPermissions)
            .end(done);
        });

      });

      describe('getting permissions modification', () => {

        it('getting admin permissions modification rules should return correct values', (done) => {
          var allowedToChangeByAdmin: GlobalPermission[] = [
            GlobalPermission.ADMIN,
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var expectedPermissions: IUserPermissionRuleResponse[] =
            EnumValues.getValues(GlobalPermission)
              .map(_ => GlobalPermissionConverter.convertToUserPermissionResponse(_))
              .map(_ => {
                return <IUserPermissionRuleResponse>{
                  value: _.value,
                  name: _.name,
                  description: _.description,
                  allowedToChange: allowedToChangeByAdmin.indexOf(_.value) >= 0
                }
              }).sort((_1, _2) => _1.value - _2.value);

          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN])
            .then(() => {
              server.get('/user/permissions-modification-rules')
                .expect(StatusCode.OK)
                .expect(expectedPermissions)
                .end(done);
            });
        });

        it('getting skill list admin permissions modification rules should return correct values', (done) => {
          var allowedToChangeBySkillListAdmin: GlobalPermission[] = [
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var expectedPermissions: IUserPermissionRuleResponse[] =
            EnumValues.getValues(GlobalPermission)
              .map(_ => GlobalPermissionConverter.convertToUserPermissionResponse(_))
              .map(_ => {
                return <IUserPermissionRuleResponse>{
                  value: _.value,
                  name: _.name,
                  description: _.description,
                  allowedToChange: allowedToChangeBySkillListAdmin.indexOf(_.value) >= 0
                }
              });

          UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.SKILLS_LIST_ADMIN])
            .then(() => {
              server.get('/user/permissions-modification-rules')
                .expect(StatusCode.OK)
                .expect(expectedPermissions.sort((_1, _2) => _1.value - _2.value))
                .end(done);
            });
        });

      });

      describe('logout', notAuthorizedTests);

    };

  }

  describe('user not logged in', notAuthorizedTests);

  describe('user registered', autorizedTests(() => {
    return UserLoginManager.registerUser(server, userDefinition)
      .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
  }));

  describe('user logged in', autorizedTests(() => {
    return UserLoginManager.registerUser(server, userDefinition)
      .then(() => UserLoginManager.loginUser(server, userDefinition))
      .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
  }));

});
