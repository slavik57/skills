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
import {AddSkillContributionOperation} from './addSkillContributionOperation';

chai.use(chaiAsPromised);

describe('AddSkillContributionOperation', () => {

  var executingUser: User;
  var operation: AddSkillContributionOperation;
  var skill: Skill;
  var skillContribution: Skill;

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
    var skillContributionInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skillContribution');

    var createSkillPromise: Promise<any> =
      EnvironmentDirtifier.createUsers(1)
        .then((_users: User[]) => Promise.all([
          SkillsDataHandler.createSkill(skillInfo, _users[0].id),
          SkillsDataHandler.createSkill(skillContributionInfo, _users[0].id)
        ]))
        .then((_skills: Skill[]) => {
          [skill, skillContribution] = _skills;

          operation = new AddSkillContributionOperation(skill.id, skillContribution.attributes.name, executingUser.id);
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

      it('should fail and not add contribution', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => SkillsDataHandler.getSkillContributions(skill.id))
          .then((_skillContributions: Skill[]) => {
            expect(_skillContributions).to.be.length(0);
          });
      });

    });

    var sufficientPermissionsTests = (permissionsToAdd: GlobalPermission[]) => {
      return () => {
        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, permissionsToAdd);
        });

        it('should succeed and add contribution', () => {
          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => SkillsDataHandler.getSkillContributions(skill.id))
            .then((_skills: Skill[]) => {
              expect(_skills).to.be.length(1);

              ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillContribution.attributes);
            });
        });

        it('adding a skill contributuin as itself should fail correctly', () => {
          var operation = new AddSkillContributionOperation(skill.id, skill.attributes.name, executingUser.id);

          return expect(operation.execute()).to.eventually.rejected
            .then((error: any) => {
              expect(ErrorUtils.isErrorOfType(error, SkillSelfPrerequisiteError)).to.be.true;
            });
        });

      }
    }

    describe('executing user is ADMIN', sufficientPermissionsTests([GlobalPermission.ADMIN]));

    describe('executing user is SKILLS_LIST_ADMIN', sufficientPermissionsTests([GlobalPermission.SKILLS_LIST_ADMIN]));

  });

});
