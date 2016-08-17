import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {ITeamMemberResponse} from "../apiResponses/iTeamMemberResponse";
import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
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

  function getExpectedTeamsMembers(team: Team, teamMembers: User[], teamMemberInfos: ITeamMemberInfo[]): ITeamMemberResponse[] {
    var result: ITeamMemberResponse[] = [];

    for (var i = 0; i < teamMembers.length; i++) {
      result.push({
        id: teamMembers[i].id,
        username: teamMembers[i].attributes.username,
        isAdmin: teamMemberInfos[i].is_admin
      });
    }

    return result;
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

    describe('checking if team exists', () => {

      it('not existing team should fail', (done) => {
        server.get('/teams/notExistingTeam/exists')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('existing team should fail', (done) => {
        server.get('/teams/' + teams[0].attributes.name + '/exists')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    })

    it('deleting team should fail', (done) => {
      server.delete('/teams/' + teams[0].id)
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('updating team details should fail', (done) => {
      server.put('/teams/1')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('getting team members should fail', (done) => {
      server.get('/teams/' + teams[0].id + '/members')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('adding team member should fail', (done) => {
      server.post('/teams/1/members')
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

      describe('checking if team exists', () => {

        it('not existing team', (done) => {
          server.get('/teams/notExistingTeam/exists')
            .expect(StatusCode.OK)
            .expect({ teamExists: false })
            .end(done);
        });

        it('existing team should return true', (done) => {
          server.get('/teams/' + teams[0].attributes.name + '/exists')
            .expect(StatusCode.OK)
            .expect({ teamExists: true })
            .end(done);
        });

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

      describe('delete team', () => {

        it('deleting team without sufficient permissions should fail', (done) => {
          server.delete('/teams/' + teams[0].id)
            .send({ name: 'some new name' })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        })

        var sufficientPermissionsTests = () => {

          it('deleting not existing team should succeed', (done) => {
            server.delete('/teams/' + 9996655)
              .expect(StatusCode.OK)
              .end(done);
          });

          it('deleting existing team should succeed', (done) => {
            server.delete('/teams/' + teams[0].id)
              .expect(StatusCode.OK)
              .end(done);
          });

          it('deleting existing team should delete the team', (done) => {
            var teamIdToDelete: number = teams[0].id;

            server.delete('/teams/' + teamIdToDelete)
              .end(() => {
                TeamsDataHandler.getTeams()
                  .then((_teams: Team[]) => _.map(_teams, _ => _.id))
                  .then((_teamIds: number[]) => {
                    expect(_teamIds).not.to.contain(teamIdToDelete);
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

      describe('update team name', () => {

        var teamToUpdate: Team;

        beforeEach(() => {
          teamToUpdate = teams[0];
        });

        it('on invalid team name should fail', (done) => {
          server.put('/teams/' + teamToUpdate.id)
            .send({ name: '' })
            .expect(StatusCode.BAD_REQUEST)
            .end(done);
        });

        it('without sufficient permissions should fail', (done) => {
          server.put('/teams/' + teamToUpdate.id)
            .send({ name: 'new name' })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        });

        var sufficientPermissionsTests = () => {

          it('without body should fail', (done) => {
            server.put('/teams/' + teamToUpdate.id)
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty body should fail', (done) => {
            server.put('/teams/' + teamToUpdate.id)
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty team name should fail', (done) => {
            server.put('/teams/' + teamToUpdate.id)
              .send({ name: '' })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with existing team name should fail', (done) => {
            server.put('/teams/' + teamToUpdate.id)
              .send({ name: teams[1].attributes.name })
              .expect(StatusCode.CONFLICT)
              .end(done);
          });

          it('with new team name should succeed', (done) => {
            server.put('/teams/' + teamToUpdate.id)
              .send({ name: 'some new team name' })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('with new team name should update the team', (done) => {
            var newTeamName = 'some new team name';

            server.put('/teams/' + teamToUpdate.id)
              .send({ name: newTeamName })
              .end(() => {
                TeamsDataHandler.getTeam(teamToUpdate.id)
                  .then((_team: Team) => {
                    expect(_team.attributes.name).to.be.equal(newTeamName);
                    done();
                  });
              });
          });

          it('should return the team info', (done) => {
            var newTeamName = 'some new team name';

            server.put('/teams/' + teamToUpdate.id)
              .send({ name: newTeamName })
              .end((error, response: Response) => {
                expect(response.body).to.deep.equal(<ITeamInfoResponse>{
                  id: teamToUpdate.id,
                  teamName: newTeamName
                });
                done();
              });
          });

        }

        describe('user is admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('user is teams list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('user is team admin', () => {

          beforeEach(() => {
            var teamMemberInfo: ITeamMemberInfo = {
              team_id: teamToUpdate.id,
              user_id: executingUser.id,
              is_admin: true
            }

            return TeamsDataHandler.addTeamMember(teamMemberInfo);
          })

          sufficientPermissionsTests();
        });

      });

      describe('getting team members', () => {

        var teamOfTeamMembers: Team;
        var teamMembers: User[];
        var teamMemberInfos: ITeamMemberInfo[];

        beforeEach(() => {
          teamOfTeamMembers = teams[0];

          return EnvironmentDirtifier.createUsers(3, '_getTeamMember')
            .then((_users: User[]) => {
              teamMembers = _users;

              teamMemberInfos = [
                { team_id: teamOfTeamMembers.id, user_id: teamMembers[0].id, is_admin: true },
                { team_id: teamOfTeamMembers.id, user_id: teamMembers[1].id, is_admin: false },
                { team_id: teamOfTeamMembers.id, user_id: teamMembers[2].id, is_admin: true }
              ]
            })
            .then(() => Promise.all([
              TeamsDataHandler.addTeamMember(teamMemberInfos[0]),
              TeamsDataHandler.addTeamMember(teamMemberInfos[1]),
              TeamsDataHandler.addTeamMember(teamMemberInfos[2])
            ]));
        });

        it('should return correct team members', (done) => {
          var expectedTeamMembers: IUserInfoResponse[] =
            getExpectedTeamsMembers(teamOfTeamMembers, teamMembers, teamMemberInfos).sort((_1, _2) => _1.id - _2.id);

          server.get('/teams/' + teamOfTeamMembers.id + '/members')
            .expect(StatusCode.OK)
            .expect(expectedTeamMembers)
            .end(done);
        });

      });

      describe('add team member', () => {

        let teamToAddUserTo: Team;
        let userToAdd: User;

        beforeEach(() => {
          teamToAddUserTo = teams[0];

          return EnvironmentDirtifier.createUsers(1, 'team_member_to_add')
            .then((_users: User[]) => {
              [userToAdd] = _users;
            });
        });

        it('on invalid username should fail', (done) => {
          server.post('/teams/' + teamToAddUserTo.id + '/members')
            .send({ username: '' })
            .expect(StatusCode.BAD_REQUEST)
            .end(done);
        });

        it('without sufficient permissions should fail', (done) => {
          server.post('/teams/' + teamToAddUserTo.id + '/members')
            .send({ username: userToAdd.attributes.username })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        });

        var sufficientPermissionsTests = () => {

          it('without body should fail', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty body should fail', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty username should fail', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: '' })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with not existing username should fail', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: 'not existing username' })
              .expect(StatusCode.NOT_FOUND)
              .end(done);
          });

          it('with exiting username should succeed', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: userToAdd.attributes.username })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('with existing username should add the user to the team', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: userToAdd.attributes.username })
              .end(() => {
                TeamsDataHandler.getTeamMembers(teamToAddUserTo.id)
                  .then((_teamMembers: IUserOfATeam[]) => _.find(_teamMembers, _member => _member.user.id === userToAdd.id))
                  .then((_teamMember: IUserOfATeam) => {
                    expect(_teamMember.user.attributes.username).to.be.equal(userToAdd.attributes.username);
                    done();
                  });
              });
          });

          it('should return the user info', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: userToAdd.attributes.username })
              .end((error, response: Response) => {
                expect(response.body).to.deep.equal(<ITeamMemberResponse>{
                  id: userToAdd.id,
                  username: userToAdd.attributes.username,
                  isAdmin: false
                });
                done();
              });
          });

          it('with user that is already in the team should fail', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: userToAdd.attributes.username })
              .end(() => {
                server.post('/teams/' + teamToAddUserTo.id + '/members')
                  .send({ username: userToAdd.attributes.username })
                  .expect(StatusCode.CONFLICT)
                  .end(done)
              });
          });

          it('with user that is already in the team should fail with correct error', (done) => {
            server.post('/teams/' + teamToAddUserTo.id + '/members')
              .send({ username: userToAdd.attributes.username })
              .end(() => {
                server.post('/teams/' + teamToAddUserTo.id + '/members')
                  .send({ username: userToAdd.attributes.username })
                  .expect({ error: 'The user is already in the team' })
                  .end(done)
              });
          });

        }

        describe('user is admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('user is teams list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('user is team admin', () => {

          beforeEach(() => {
            var teamMemberInfo: ITeamMemberInfo = {
              team_id: teamToAddUserTo.id,
              user_id: executingUser.id,
              is_admin: true
            }

            return TeamsDataHandler.addTeamMember(teamMemberInfo);
          })

          sufficientPermissionsTests();
        });

      });

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
