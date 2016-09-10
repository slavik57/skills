import {SkillSelfPrerequisiteError} from "../../../common/errors/skillSelfPrerequisiteError";
import {ErrorUtils} from "../../../common/errors/errorUtils";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
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
import {AddSkillPrerequisiteOperation} from './addSkillPrerequisiteOperation';

chai.use(chaiAsPromised);

describe('AddSkillPrerequisiteOperation', () => {

  var executingUser: User;
  var operation: AddSkillPrerequisiteOperation;
  var skill: Skill;
  var skillPrerequisite: Skill;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  beforeEach(() => {
    var userCreationPromise: Promise<any> =
      UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
        .then((_user: User) => {
          executingUser = _user;

        });

    var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skill');
    var skillPrerequisiteInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skillPrerequisite');

    var createSkillPromise: Promise<any> =
      EnvironmentDirtifier.createUsers(1)
        .then((_users: User[]) => Promise.all([
          SkillsDataHandler.createSkill(skillInfo, _users[0].id),
          SkillsDataHandler.createSkill(skillPrerequisiteInfo, _users[0].id)
        ]))
        .then((_skills: Skill[]) => {
          [skill, skillPrerequisite] = _skills;

          operation = new AddSkillPrerequisiteOperation(skill.id, skillPrerequisite.attributes.name, executingUser.id);
        });

    return Promise.all(
      [
        userCreationPromise,
        createSkillPromise
      ]
    );
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('canExecute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.READER,
            GlobalPermission.GUEST
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions)
      });

      it('should reject', () => {
        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

    });

    describe('executing user is global admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fulfil', () => {
        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('executing user is skills list admin', () => {

      beforeEach(() => {
        var permissions: GlobalPermission[] =
          [
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fulfil', () => {
        // Act
        var result: Promise<any> = operation.canExecute();

        // Assert
        return expect(result).to.eventually.fulfilled;
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

      it('should fail and not add prerequisite', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => SkillsDataHandler.getSkillPrerequisites(skill.id))
          .then((_skillPrerequisites: Skill[]) => {
            expect(_skillPrerequisites).to.be.length(0);
          });
      });

    });

    var sufficientPermissionsTests = (permissionsToAdd: GlobalPermission[]) => {

      return () => {
        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, permissionsToAdd);
        });

        it('should succeed and add prerequisite', () => {
          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => SkillsDataHandler.getSkillPrerequisites(skill.id))
            .then((_skills: Skill[]) => {
              expect(_skills).to.be.length(1);

              ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillPrerequisite.attributes);
            });
        });

        it('adding a skill prerequisite as itself should fail correctly', () => {
          var operation = new AddSkillPrerequisiteOperation(skill.id, skill.attributes.name, executingUser.id);

          return expect(operation.execute()).to.eventually.rejected
            .then((error: any) => {
              expect(ErrorUtils.isErrorOfType(error, SkillSelfPrerequisiteError)).to.be.true;
            });
        });
      }

    };

    describe('executing user is ADMIN', sufficientPermissionsTests([GlobalPermission.ADMIN]));

    describe('executing user is SKILLS_LIST_ADMIN', sufficientPermissionsTests([GlobalPermission.SKILLS_LIST_ADMIN]));

  });

});
