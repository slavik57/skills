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
import {SuperTest} from 'supertest';
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

    return EnvironmentDirtifier.createUsers(5)
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

  describe('user not logged in', () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    })

    it('getting users details should fail', (done) => {
      server.get('/users')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('getting filtered users details by partial username should fail', (done) => {
      server.get('/users/filtered/1')
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

          users.push(user);
        });
    });

    it('getting users details should succeed', (done) => {
      var expectedUsers = getExpectedUsersDetails(users).sort((_1, _2) => _1.id - _2.id);

      server.get('/users')
        .expect(StatusCode.OK)
        .expect(expectedUsers)
        .end(done);
    });

    it('getting filtered users details by partial username should return one user', (done) => {
      var usersWith1 = _.filter(users, _ => _.attributes.username.indexOf('1') >= 0);

      var expectedUsers = getExpectedUsersDetails(usersWith1);
      expect(expectedUsers.length > 0).to.be.true;

      server.get('/users/filtered/1')
        .expect(StatusCode.OK)
        .expect(expectedUsers)
        .end(done);
    });

    it('getting filtered users details by partial username should return all users', (done) => {
      var usersWithUsername = _.filter(users, _ => _.attributes.username.indexOf('username') >= 0);

      var expectedUsers = getExpectedUsersDetails(usersWithUsername);
      expect(expectedUsers.length > 0).to.be.true;

      server.get('/users/filtered/username')
        .expect(StatusCode.OK)
        .expect(expectedUsers)
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('getting users details should fail', (done) => {
        server.get('/users')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('getting filtered users details by partial username should fail', (done) => {
        server.get('/users/filtered/1')
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

          users.push(user);
        });
    });

    it('getting user details should succeed', (done) => {
      var expectedUsers = getExpectedUsersDetails(users);

      server.get('/users')
        .expect(StatusCode.OK)
        .expect(expectedUsers)
        .end(done);
    });

    it('getting filtered users details by partial username should return once user', (done) => {
      var usersWith1 = _.filter(users, _ => _.attributes.username.indexOf('1') >= 0);

      var expectedUsers = getExpectedUsersDetails(usersWith1);
      expect(expectedUsers.length > 0).to.be.true;

      server.get('/users/filtered/1')
        .expect(StatusCode.OK)
        .expect(expectedUsers)
        .end(done);
    });

    it('getting filtered users details by partial username should return all users', (done) => {
      var usersWithUsername = _.filter(users, _ => _.attributes.username.indexOf('username') >= 0);

      var expectedUsers = getExpectedUsersDetails(usersWithUsername);
      expect(expectedUsers.length > 0).to.be.true;

      server.get('/users/filtered/username')
        .expect(StatusCode.OK)
        .expect(expectedUsers)
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('getting users details should fail', (done) => {
        server.get('/users')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('getting filtered users details by partial username should fail', (done) => {
        server.get('/users/filtered/1')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

  });

});
