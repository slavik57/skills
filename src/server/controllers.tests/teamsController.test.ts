import {GlobalPermission} from "../models/enums/globalPermission";
import {Team} from "../models/team";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {ITeamInfoResponse} from "../apiResponses/iTeamInfoResponse";
import {UserLoginManager} from "../testUtils/userLoginManager";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
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

  var notAuthorizedTests = () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    });

    it('getting teams details should fail', (done) => {
      server.get('/teams')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('adding team should fail', (done) => {
      server.post('/teams')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

  };

  function authorizdedTests(beforeEachFunc: () => Promise<User>) {
    return () => {

      var executingUser: User;

      beforeEach(() => {
        return beforeEachFunc()
          .then((_user: User) => {
            executingUser = _user;
          })
      });

      it('getting teams details should succeed', (done) => {
        var expectedUsers = getExpectedTeamsDetails(teams).sort((_1, _2) => _1.id - _2.id);

        server.get('/teams')
          .expect(StatusCode.OK)
          .expect(expectedUsers)
          .end(done);
      });

      describe('add team', () => {

        it('adding team without sufficient permissions should fail', (done) => {
          server.post('/teams')
            .send({ name: 'some new name' })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        })

        var sufficientPermissionsTests = () => {

          it('adding team without body should fail', (done) => {
            server.post('/teams')
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('adding team with empty body should fail', (done) => {
            server.post('/teams')
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('adding team with empty team name should fail', (done) => {
            server.post('/teams')
              .send({ name: '' })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('adding team with existing team name should fail', (done) => {
            server.post('/teams')
              .send({ name: teams[0].attributes.name })
              .expect(StatusCode.CONFLICT)
              .end(done);
          });

          it('adding new team should succeed', (done) => {
            server.post('/teams')
              .send({ name: 'some new team name' })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('adding new team should add the team', (done) => {
            var newTeamName = 'some new team name';

            server.post('/teams')
              .send({ name: newTeamName })
              .end(() => {
                TeamsDataHandler.getTeams()
                  .then((_teams: Team[]) => _.find(_teams, _ => _.attributes.name === newTeamName))
                  .then((_team: Team) => {
                    expect(_team).to.exist;
                    done();
                  });
              });
          });

          it('adding new team should return the team info', (done) => {
            var newTeamName = 'some new team name';

            server.post('/teams')
              .send({ name: newTeamName })
              .end((error, response: Response) => {
                return TeamsDataHandler.getTeams()
                  .then((_teams: Team[]) => _.find(_teams, _ => _.attributes.name === newTeamName))
                  .then((_team: Team) => {
                    expect(response.body).to.deep.equal(<ITeamInfoResponse>{
                      id: _team.id,
                      teamName: newTeamName
                    });
                    done();
                  });
              });
          });

        }

        describe('User is admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('User is teams list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

      });

      describe('logout', notAuthorizedTests);

    }
  }

  describe('user not logged in', notAuthorizedTests);

  describe('user registered',
    authorizdedTests(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
    })
  );

  describe('user logged in',
    authorizdedTests(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserLoginManager.logoutUser(server))
        .then(() => UserLoginManager.loginUser(server, userDefinition))
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
    })
  );

});
