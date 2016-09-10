import {SkillPrerequisite} from "../models/skillPrerequisite";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
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
import * as bluebirdPromise from 'bluebird';

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

    it('deleting skill should fail', (done) => {
      server.delete('/skills/1')
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

    it('getting skill prerequisites should fail', (done) => {
      server.get('/skills/' + skills[0].id + '/prerequisites')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('getting skill dependencies should fail', (done) => {
      server.get('/skills/' + skills[0].id + '/dependencies')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('adding skill prerequisite should fail', (done) => {
      server.post('/skills/1/prerequisites')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('adding skill dependency should fail', (done) => {
      server.post('/skills/1/dependencies')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    it('deleting skill prerequisite should fail', (done) => {
      server.delete('/skills/1/prerequisites')
        .expect(StatusCode.UNAUTHORIZED)
        .end(done);
    });

    describe('get filtered skills details by partial skill name', () => {

      it('should fail', (done) => {
        server.get('/skills/filtered/a')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

      it('with maximum number of skills should fail', (done) => {
        server.get('/skills/filtered/a?max=12')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

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

      describe('getting skill prerequisites', () => {

        var skillOfSkillPrerequisites: Skill;
        var skillPrerequisites: Skill[];
        var skillPrerequisitesInfos: ISkillPrerequisiteInfo[];

        beforeEach(() => {
          skillOfSkillPrerequisites = skills[0];

          skillPrerequisitesInfos = [
            ModelInfoMockFactory.createSkillPrerequisiteInfo(skillOfSkillPrerequisites, skills[1]),
            ModelInfoMockFactory.createSkillPrerequisiteInfo(skillOfSkillPrerequisites, skills[2])
          ];

          skillPrerequisites = [skills[1], skills[2]];

          return bluebirdPromise.all([
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisitesInfos[0]),
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisitesInfos[1])
          ]);
        });

        it('should return correct skill prerequisites', (done) => {
          var expected: ISkillInfoResponse[] =
            getExpectedSkillsDetails(skillPrerequisites).sort((_1, _2) => _1.id - _2.id);

          server.get('/skills/' + skillOfSkillPrerequisites.id + '/prerequisites')
            .expect(StatusCode.OK)
            .expect(expected)
            .end(done);
        });

      });

      describe('getting skill dependencies', () => {

        var skillOfSkillDependencies: Skill;
        var skillDependencies: Skill[];
        var skillDependenciesInfos: ISkillPrerequisiteInfo[];

        beforeEach(() => {
          skillOfSkillDependencies = skills[0];

          skillDependenciesInfos = [
            ModelInfoMockFactory.createSkillPrerequisiteInfo(skills[1], skillOfSkillDependencies),
            ModelInfoMockFactory.createSkillPrerequisiteInfo(skills[2], skillOfSkillDependencies)
          ];

          skillDependencies = [skills[1], skills[2]];

          return bluebirdPromise.all([
            SkillsDataHandler.addSkillPrerequisite(skillDependenciesInfos[0]),
            SkillsDataHandler.addSkillPrerequisite(skillDependenciesInfos[1])
          ]);
        });

        it('should return correct skill dependencies', (done) => {
          var expected: ISkillInfoResponse[] =
            getExpectedSkillsDetails(skillDependencies).sort((_1, _2) => _1.id - _2.id);

          server.get('/skills/' + skillOfSkillDependencies.id + '/dependencies')
            .expect(StatusCode.OK)
            .expect(expected)
            .end(done);
        });

      });

      describe('add skill prerequisite', () => {

        let skillToAddPrerequisiteTo: Skill;
        let skillPrerequisiteToAdd: Skill;

        beforeEach(() => {
          skillToAddPrerequisiteTo = skills[0];
          skillPrerequisiteToAdd = skills[1];
        });

        it('on invalid skill name should fail', (done) => {
          server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
            .send({ skillName: '' })
            .expect(StatusCode.BAD_REQUEST)
            .end(done);
        });

        it('without sufficient permissions should fail', (done) => {
          server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
            .send({ skillName: skillPrerequisiteToAdd.attributes.name })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        });

        var sufficientPermissionsTests = () => {

          it('without body should fail', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty body should fail', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty skill name should fail', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: '' })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with not existing skill name should fail', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: 'not existing skill name' })
              .expect(StatusCode.NOT_FOUND)
              .end(done);
          });

          it('with exiting skill name should succeed', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillPrerequisiteToAdd.attributes.name })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('with existing skill name should add the prerequisite', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillPrerequisiteToAdd.attributes.name })
              .end(() => {
                SkillsDataHandler.getSkillPrerequisites(skillToAddPrerequisiteTo.id)
                  .then((_prerequisites: Skill[]) => _.find(_prerequisites, _prerequisite => _prerequisite.id === skillPrerequisiteToAdd.id))
                  .then((_prerequisite: Skill) => {
                    expect(_prerequisite.attributes.name).to.be.equal(skillPrerequisiteToAdd.attributes.name);
                    done();
                  });
              });
          });

          it('should return the prerequisite info', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillPrerequisiteToAdd.attributes.name })
              .end((error, response: Response) => {
                expect(response.body).to.deep.equal(<ISkillInfoResponse>{
                  id: skillPrerequisiteToAdd.id,
                  skillName: skillPrerequisiteToAdd.attributes.name
                });
                done();
              });
          });

          it('with skill that is already prerequisite should fail', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillPrerequisiteToAdd.attributes.name })
              .end(() => {
                server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                  .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                  .expect(StatusCode.CONFLICT)
                  .end(done)
              });
          });

          it('with skill that is already prerequisite should fail with correct error', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillPrerequisiteToAdd.attributes.name })
              .end(() => {
                server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
                  .send({ skillName: skillPrerequisiteToAdd.attributes.name })
                  .expect({ error: 'The skill is already a prerequisite' })
                  .end(done)
              });
          });

          it('with itself should fail', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillToAddPrerequisiteTo.attributes.name })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with itself should fail with correct error', (done) => {
            server.post('/skills/' + skillToAddPrerequisiteTo.id + '/prerequisites')
              .send({ skillName: skillToAddPrerequisiteTo.attributes.name })
              .expect({ error: 'Skill cannot be a prerequisite of itself' })
              .end(done);
          });

        }

        describe('user is admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('user is skills list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

      });

      describe('add skill dependency', () => {

        let skillToAddDependencyTo: Skill;
        let skillDependencyToAdd: Skill;

        beforeEach(() => {
          skillToAddDependencyTo = skills[0];
          skillDependencyToAdd = skills[1];
        });

        it('on invalid skill name should fail', (done) => {
          server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
            .send({ skillName: '' })
            .expect(StatusCode.BAD_REQUEST)
            .end(done);
        });

        it('without sufficient permissions should fail', (done) => {
          server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
            .send({ skillName: skillDependencyToAdd.attributes.name })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        });

        var sufficientPermissionsTests = () => {

          it('without body should fail', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty body should fail', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty skill name should fail', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: '' })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with not existing skill name should fail', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: 'not existing skill name' })
              .expect(StatusCode.NOT_FOUND)
              .end(done);
          });

          it('with exiting skill name should succeed', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillDependencyToAdd.attributes.name })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('with existing skill name should add the dependency', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillDependencyToAdd.attributes.name })
              .end(() => {
                SkillsDataHandler.getSkillPrerequisites(skillDependencyToAdd.id)
                  .then((_prerequisites: Skill[]) => _.find(_prerequisites, _prerequisite => _prerequisite.id === skillToAddDependencyTo.id))
                  .then((_prerequisite: Skill) => {
                    expect(_prerequisite.attributes.name).to.be.equal(skillToAddDependencyTo.attributes.name);
                    done();
                  });
              });
          });

          it('should return the dependency info', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillDependencyToAdd.attributes.name })
              .end((error, response: Response) => {
                expect(response.body).to.deep.equal(<ISkillInfoResponse>{
                  id: skillDependencyToAdd.id,
                  skillName: skillDependencyToAdd.attributes.name
                });
                done();
              });
          });

          it('with skill that is already dependency should fail', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillDependencyToAdd.attributes.name })
              .end(() => {
                server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                  .send({ skillName: skillDependencyToAdd.attributes.name })
                  .expect(StatusCode.CONFLICT)
                  .end(done)
              });
          });

          it('with skill that is already dependency should fail with correct error', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillDependencyToAdd.attributes.name })
              .end(() => {
                server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
                  .send({ skillName: skillDependencyToAdd.attributes.name })
                  .expect({ error: 'The skill is already a dependency' })
                  .end(done)
              });
          });

          it('with itself should fail', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillToAddDependencyTo.attributes.name })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with itself fail with correct error', (done) => {
            server.post('/skills/' + skillToAddDependencyTo.id + '/dependencies')
              .send({ skillName: skillToAddDependencyTo.attributes.name })
              .expect({ error: 'Skill cannot be a dependency of itself' })
              .end(done);
          });

        }

        describe('user is admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
          })

          sufficientPermissionsTests();
        });

        describe('user is skills list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

      });

      describe('remove skill prerequisite', () => {

        let skillToRemovePrerequisiteFrom: Skill;
        let prerequisiteSkillToRemove: Skill;

        beforeEach(() => {
          skillToRemovePrerequisiteFrom = skills[0];
          prerequisiteSkillToRemove = skills[1];

          var info: ISkillPrerequisiteInfo =
            ModelInfoMockFactory.createSkillPrerequisiteInfo(skillToRemovePrerequisiteFrom, prerequisiteSkillToRemove);

          return SkillsDataHandler.addSkillPrerequisite(info);
        });

        it('on invalid prerequisiteId should fail', (done) => {
          server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
            .send({ prerequisiteId: null })
            .expect(StatusCode.BAD_REQUEST)
            .end(done);
        });

        it('without sufficient permissions should fail', (done) => {
          server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
            .send({ prerequisiteId: prerequisiteSkillToRemove.id })
            .expect(StatusCode.UNAUTHORIZED)
            .end(done);
        });

        var sufficientPermissionsTests = () => {

          it('without body should fail', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with empty body should fail', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .send({})
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with null prerequisiteId should fail', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .send({ prerequisiteId: null })
              .expect(StatusCode.BAD_REQUEST)
              .end(done);
          });

          it('with not existing prerequisiteId should succeed', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .send({ prerequisiteId: 98765 })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('with exiting prerequisiteId should succeed', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .send({ prerequisiteId: prerequisiteSkillToRemove.id })
              .expect(StatusCode.OK)
              .end(done);
          });

          it('with existing prerequisiteId should remove the prerequisite from the skill', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .send({ prerequisiteId: prerequisiteSkillToRemove.id })
              .end(() => {
                SkillsDataHandler.getSkillPrerequisites(skillToRemovePrerequisiteFrom.id)
                  .then((_prerequisites: Skill[]) => _.find(_prerequisites, _prerequisite => _prerequisite.id === prerequisiteSkillToRemove.id))
                  .then((_prerequisite: Skill) => {
                    expect(_prerequisite).to.not.exist;
                    done();
                  });
              });
          });

          it('with prerequisite that is not in the skill prerequisites should succeed', (done) => {
            server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
              .send({ prerequisiteId: prerequisiteSkillToRemove.id })
              .end(() => {
                server.delete('/skills/' + skillToRemovePrerequisiteFrom.id + '/prerequisites')
                  .send({ prerequisiteId: prerequisiteSkillToRemove.id })
                  .expect(StatusCode.OK)
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

        describe('user is skills list admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
          })

          sufficientPermissionsTests();
        });

      });

      describe('get filtered skills details by partial skill name', () => {

        it('should return one skill', (done) => {
          var skillWith1 = _.filter(skills, _ => _.attributes.name.indexOf('skill1') >= 0);

          var expectedUsers = getExpectedSkillsDetails(skillWith1);
          expect(expectedUsers.length > 0).to.be.true;

          server.get('/skills/filtered/skill1')
            .expect(StatusCode.OK)
            .expect(expectedUsers)
            .end(done);
        });

        it('should return all skills', (done) => {
          var skillsWithSkill = _.filter(skills, _ => _.attributes.name.indexOf('skill') >= 0);

          var expectedUsers = getExpectedSkillsDetails(skillsWithSkill);
          expect(expectedUsers.length > 0).to.be.true;

          server.get('/skills/filtered/skill')
            .expect(StatusCode.OK)
            .expect(expectedUsers)
            .end(done);
        });

        it('with max number of skills limit should return one skill', (done) => {
          var usersWith1 = _.filter(skills, _ => _.attributes.name.indexOf('skill1') >= 0);

          var expectedUsers = getExpectedSkillsDetails(usersWith1);
          expect(expectedUsers.length).to.be.equal(1);

          server.get('/skills/filtered/skill1?max=12')
            .expect(StatusCode.OK)
            .expect(expectedUsers)
            .end(done);
        });

        it('with max number of skills limit should return correct number of skills', (done) => {
          var skillPrefix = 'skill';
          var allRelevantSkills = _.filter(skills, _ => _.attributes.name.indexOf(skillPrefix) >= 0);

          var allUsers: ISkillInfoResponse[] = getExpectedSkillsDetails(allRelevantSkills);

          var maxNumberOfSkills = 2;
          expect(allUsers.length).to.be.greaterThan(maxNumberOfSkills);

          server.get('/skills/filtered/' + skillPrefix + '?max=' + maxNumberOfSkills)
            .expect(StatusCode.OK)
            .end((error: any, response: Response) => {
              var actualSkills: ISkillInfoResponse[] = response.body;

              expect(actualSkills).to.be.length(maxNumberOfSkills);

              actualSkills.forEach((_skill: ISkillInfoResponse) => {
                expect(_skill.skillName).to.contain(skillPrefix);
              });

              done();
            });
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
