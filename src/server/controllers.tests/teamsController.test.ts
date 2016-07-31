import {Team} from "../models/team";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {ITeamInfoResponse} from "../apiResponses/iTeamInfoResponse";
import {UserLoginManager} from "../testUtils/userLoginManager";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
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

describe('teamsController', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserRegistrationDefinition;
  var teamCreatorUser: User;
  var teams: Team[];

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

    return EnvironmentDirtifier.createUsers(1)
      .then((_users: User[]) => {
        [teamCreatorUser] = _users;
      });
  })

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);

    return EnvironmentDirtifier.createTeams(5, teamCreatorUser.id)
      .then(() => TeamsDataHandler.getTeams())
      .then((_teams: Team[]) => {
        teams = _teams;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  function getExpectedTeamsDetails(teams: Team[]): ITeamInfoResponse[] {
    return _.map(teams, (_team: Team) => {
      return {
        id: _team.id,
        teamName: _team.attributes.name
      }
    })
  }

  function notAuthorizedTests(beforeEachFunc: () => any) {
    return () => {

      beforeEach(beforeEachFunc);

      it('getting teams details should fail', (done) => {
        server.get('/teams')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    };
  }

  function authorizdedTests(beforeEachFunc: () => any) {
    return () => {

      beforeEach(beforeEachFunc);

      it('getting teams details should succeed', (done) => {
        var expectedUsers = getExpectedTeamsDetails(teams).sort((_1, _2) => _1.id - _2.id);

        server.get('/teams')
          .expect(StatusCode.OK)
          .expect(expectedUsers)
          .end(done);
      });

      describe('logout', () => {

        beforeEach(() => {
          return UserLoginManager.logoutUser(server);
        });

        it('getting teams details should fail', (done) => {
          server.get('/teams')
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        });

      });

    }
  }

  describe('user not logged in',
    notAuthorizedTests(() => {
      return UserLoginManager.logoutUser(server);
    })
  );

  describe('user registered',
    authorizdedTests(() => {
      return UserLoginManager.registerUser(server, userDefinition);
    })
  );

  describe('user logged in',
    authorizdedTests(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserLoginManager.logoutUser(server))
        .then(() => UserLoginManager.loginUser(server, userDefinition))
    })
  );

});
