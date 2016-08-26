import {GlobalPermission} from "../models/enums/globalPermission";
import {ISkillInfoResponse} from "../apiResponses/iSkillInfoResponse";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {SkillsDataHandler} from "../dataHandlers/skillsDataHandler";
import {Skill} from "../models/skill";
import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {User} from "../models/user";
import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {UserLoginManager} from "../testUtils/userLoginManager";
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

describe('skillsController', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserRegistrationDefinition;
  var skillCreatorUser: User;
  var skills: Skill[];

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
        [skillCreatorUser] = _users;
      });
  })

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);

    return EnvironmentDirtifier.createSkills(5, skillCreatorUser.id)
      .then(() => SkillsDataHandler.getSkills())
      .then((_skills: Skill[]) => {
        skills = _skills;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  function getExpectedSkillsDetails(skills: Skill[]): ISkillInfoResponse[] {
    return _.map(skills, (_skill: Skill) => {
      return {
        id: _skill.id,
        skillName: _skill.attributes.name
      }
    })
  }

  var notAuthorizedTests = () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    });

    it('getting skills details should fail', (done) => {
      server.get('/skills')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('adding skill should fail', (done) => {
      server.post('/skills')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    describe('checking if skill exists', () => {

      it('not existing skill should fail', (done) => {
        server.get('/skills/notExistingSkill/exists')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('existing skill should fail', (done) => {
        server.get('/skills/' + skills[0].attributes.name + '/exists')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    })

  };

  var authorizdedTests = (beforeEachFunc: () => Promise<User>) => {
    return () => {

      var executingUser: User;

      beforeEach(() => {
        return beforeEachFunc()
          .then((_user: User) => {
            executingUser = _user;
          })
      });

      it('getting skills details should succeed', (done) => {
        var expectedSkills = getExpectedSkillsDetails(skills).sort((_1, _2) => _1.id - _2.id);

        server.get('/skills')
          .expect(StatusCode.OK)
          .expect(expectedSkills)
          .end(done);
      });

      describe('checking if skill exists', () => {

        it('not existing skill', (done) => {
          server.get('/skills/notExistingSkill/exists')
            .expect(StatusCode.OK)
            .expect({ skillExists: false })
            .end(done);
        });

        it('existing skill should return true', (done) => {
          server.get('/skills/' + skills[0].attributes.name + '/exists')
            .expect(StatusCode.OK)
            .expect({ skillExists: true })
            .end(done);
        });

      });

      describe('add skill', () => {

        it('adding skill without sufficient permissions should fail', (done) => {
          server.post('/skills')
            .send({ name: 'some new name' })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        })

        var sufficientPermissionsTests = () => {

          it('adding skill without body should fail', (done) => {
            server.post('/skills')
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('adding skill with empty body should fail', (done) => {
            server.post('/skills')
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('adding skill with empty skill name should fail', (done) => {
            server.post('/skills')
              .send({ name: '' })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('adding skill with existing skill name should fail', (done) => {
            server.post('/skills')
              .send({ name: skills[0].attributes.name })
              .expect(StatusCode.CONFLICT)
              .end(done);
          });

          it('adding new skill should succeed', (done) => {
            server.post('/skills')
              .send({ name: 'some new skill name' })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('adding new skill should add the skill', (done) => {
            var newSkillName = 'some new skill name';

            server.post('/skills')
              .send({ name: newSkillName })
              .end(() => {
                SkillsDataHandler.getSkills()
                  .then((_skills: Skill[]) => _.find(_skills, _ => _.attributes.name === newSkillName))
                  .then((_skill: Skill) => {
                    expect(_skill).to.exist;
                    done();
                  });
              });
          });

          it('adding new skill should return the skill info', (done) => {
            var newSkillName = 'some new skill name';

            server.post('/skills')
              .send({ name: newSkillName })
              .end((error, response: Response) => {
                return SkillsDataHandler.getSkills()
                  .then((_skills: Skill[]) => _.find(_skills, _ => _.attributes.name === newSkillName))
                  .then((_skill: Skill) => {
                    expect(response.body).to.deep.equal(<ISkillInfoResponse>{
                      id: _skill.id,
                      skillName: newSkillName
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

        describe('User is skills list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

      });

      describe('delete skill', () => {

        it('deleting skill without sufficient permissions should fail', (done) => {
          server.delete('/skills/' + skills[0].id)
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        })

        var sufficientPermissionsTests = () => {

          it('deleting not existing skill should succeed', (done) => {
            server.delete('/skills/' + 9996655)
              .expect(StatusCode.OK)
              .end(done);
          });

          it('deleting existing skill should succeed', (done) => {
            server.delete('/skills/' + skills[0].id)
              .expect(StatusCode.OK)
              .end(done);
          });

          it('deleting existing skill should delete the skill', (done) => {
            var skillIdToDelete: number = skills[0].id;

            server.delete('/skills/' + skillIdToDelete)
              .end(() => {
                SkillsDataHandler.getSkills()
                  .then((_skills: Skill[]) => _.map(_skills, _ => _.id))
                  .then((_skillIds: number[]) => {
                    expect(_skillIds).not.to.contain(skillIdToDelete);
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

        describe('User is skills list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
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
