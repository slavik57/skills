import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {ErrorUtils} from "../../../common/errors/errorUtils";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {SkillCreator} from "../../models/skillCreator";
import {ISkillCreatorInfo} from "../../models/interfaces/iSkillCreatorInfo";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {Skill} from "../../models/skill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../../models/interfaces/iSkillInfo";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {AddSkillOperation} from './addSkillOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('AddSkillOperation', () => {

  var skillInfoToAdd: ISkillInfo;
  var executingUser: User;
  var existingSkill: Skill;
  var operation: AddSkillOperation;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  beforeEach(() => {
    skillInfoToAdd = ModelInfoMockFactory.createSkillInfo('skill');

    var userCreationPromise: Promise<any> =
      UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
        .then((_user: User) => {
          executingUser = _user;
        })
        .then(() => EnvironmentDirtifier.createSkills(1, executingUser.id))
        .then((_skills: Skill[]) => {
          [existingSkill] = _skills;
        })
        .then(() => {
          operation = new AddSkillOperation(executingUser.id, skillInfoToAdd);
        });

    return userCreationPromise;
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('canExecute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

      it('adding existing skill should fail', () => {
        var skillInfo: ISkillInfo =
          ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);

        var operation = new AddSkillOperation(executingUser.id, skillInfo);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
          });
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

      it('adding existing skill should fail', () => {
        var skillInfo: ISkillInfo =
          ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);

        var operation = new AddSkillOperation(executingUser.id, skillInfo);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
          });
      });

    });

  });

  describe('execute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail and not add skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => SkillsDataHandler.getSkillByName(skillInfoToAdd.name))
          .then((_skill: Skill) => {
            expect(_skill).to.not.exist;
          });
      });

    });

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed and add skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => SkillsDataHandler.getSkillByName(skillInfoToAdd.name))
          .then((_skill: Skill) => {
            ModelInfoVerificator.verifyInfo(_skill.attributes, skillInfoToAdd);
          });
      });

      it('should add the user as skill creator', () => {
        // Act
        var resultPromise: Promise<Skill> = operation.execute();

        // Assert
        var skill: Skill;
        return expect(resultPromise).to.eventually.fulfilled
          .then((_skill: Skill) => {
            skill = _skill;
          })
          .then(() => SkillsDataHandler.getSkillsCreators())
          .then((_skillsCreators: SkillCreator[]) => {
            return _.find(_skillsCreators, _ => _.attributes.skill_id === skill.id);
          })
          .then((_skillsCreator: SkillCreator) => {
            var expectedSkillCreatorInfo: ISkillCreatorInfo = {
              user_id: executingUser.id,
              skill_id: skill.id
            };

            ModelInfoVerificator.verifyInfo(_skillsCreator.attributes, expectedSkillCreatorInfo);
          });
      });

      it('adding existing skill should fail', () => {
        var skillInfo: ISkillInfo =
          ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);

        var operation = new AddSkillOperation(executingUser.id, skillInfo);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
          });
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed and add skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => SkillsDataHandler.getSkillByName(skillInfoToAdd.name))
          .then((_skill: Skill) => {
            ModelInfoVerificator.verifyInfo(_skill.attributes, skillInfoToAdd);
          });
      });

      it('should add the user as skill creator', () => {
        // Act
        var resultPromise: Promise<Skill> = operation.execute();

        // Assert
        var skill: Skill;
        return expect(resultPromise).to.eventually.fulfilled
          .then((_skill: Skill) => {
            skill = _skill;
          })
          .then(() => SkillsDataHandler.getSkillsCreators())
          .then((_skillsCreators: SkillCreator[]) => {
            return _.find(_skillsCreators, _ => _.attributes.skill_id === skill.id);
          })
          .then((_skillsCreator: SkillCreator) => {
            var expectedSkillCreatorInfo: ISkillCreatorInfo = {
              user_id: executingUser.id,
              skill_id: skill.id
            };

            ModelInfoVerificator.verifyInfo(_skillsCreator.attributes, expectedSkillCreatorInfo);
          });
      });

      it('adding existing skill should fail', () => {
        var skillInfo: ISkillInfo =
          ModelInfoMockFactory.createSkillInfo(existingSkill.attributes.name);

        var operation = new AddSkillOperation(executingUser.id, skillInfo);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
          });
      });

    });

  });

});
