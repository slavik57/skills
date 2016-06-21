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

describe('ApiUserController', () => {

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
      firstName: user.attributes.firstName,
      lastName: user.attributes.lastName
    }
  }

  describe('user not logged in', () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    })

    it('getting user details should fail', (done) => {
      server.get('/apiuser')
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

      server.get('/apiuser')
        .expect(StatusCode.OK)
        .expect(expectedUser)
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('getting user details should fail', (done) => {
        server.get('/apiuser')
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

      server.get('/apiuser')
        .expect(StatusCode.OK)
        .expect(expectedUser)
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('getting user details should fail', (done) => {
        server.get('/apiuser')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

  });

});
