import {IUserInfo} from "../models/interfaces/iUserInfo";
import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
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
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from '../enums/statusCode';
import {webpackInitializationTimeout} from '../../../testConfigurations';

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

  function getExpectedUserDetails(user: User): IUserInfoResponse {
    return {
      id: user.id,
      username: user.attributes.username,
      email: user.attributes.email,
      firstName: user.attributes.firstName,
      lastName: user.attributes.lastName
    }
  }

  describe('user not logged in', () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    })

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

    it('updating user details should fail', (done) => {
      server.put('/user/1')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

  });

  describe('user registered', () => {

    var user: User;

    beforeEach(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
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

    describe('logout', () => {

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
        server.get('/user/' + userDefinition.username + '/exists')
          .expect(StatusCode.OK)
          .expect({ userExists: true })
          .end(done);
      });

      it('updating user details should fail', (done) => {
        server.put('/user/' + user.id)
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

  });

  describe('user logged in', () => {

    var user: User;

    beforeEach(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserLoginManager.loginUser(server, userDefinition))
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
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

    describe('logout', () => {

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
        server.get('/user/' + userDefinition.username + '/exists')
          .expect(StatusCode.OK)
          .expect({ userExists: true })
          .end(done);
      });

      it('updating user details should fail', (done) => {
        server.put('/user/' + user.id)
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

  });

});
