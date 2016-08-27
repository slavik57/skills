import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {ISkillModificationPermissionsResponse} from "../../apiResponses/iSkillModificationPermissionsResponse";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {ErrorUtils} from "../../../common/errors/errorUtils";
import {Skill} from "../../models/skill";
import {User} from "../../models/user";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetSkillModificationPermissionsOperation} from './getSkillModificationPermissionsOperation';
import {EnumValues} from 'enum-values';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillModificationPermissionsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;
    var skill: Skill;

    beforeEach(() => {
      return EnvironmentDirtifier.createUsers(1)
        .then((_users: User[]) => {
          [executingUser] = _users;
        })
        .then(() => EnvironmentDirtifier.createSkills(1, executingUser.id))
        .then((_skills: Skill[]) => {
          [skill] = _skills;
        });
    });

    it('not existing skill should reject correctly', () => {
      var operation = new GetSkillModificationPermissionsOperation(123321, executingUser.id);

      return expect(operation.execute()).to.eventually.rejected
        .then((_error: any) => {
          expect(ErrorUtils.isErrorOfType(_error, NotFoundError)).to.be.true;
        });
    });

    it('not existing user should reject correctly', () => {
      var operation = new GetSkillModificationPermissionsOperation(skill.id, 1232123);

      return expect(operation.execute()).to.eventually.rejected
        .then((_error: any) => {
          expect(ErrorUtils.isErrorOfType(_error, NotFoundError)).to.be.true;
        });
    });

    it('for admin should return correct value', () => {
      // Arrange
      var permissions: GlobalPermission[] = [
        GlobalPermission.ADMIN
      ];

      var addPermissions = UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

      var operation = new GetSkillModificationPermissionsOperation(skill.id, executingUser.id);

      var expectedPermissions: ISkillModificationPermissionsResponse = {
        canModifyPrerequisites: true,
        canModifyDependencies: true
      }

      // Act
      var executePromise = addPermissions.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for skills list admin should return correct value', () => {
      // Arrange
      var permissions: GlobalPermission[] = [
        GlobalPermission.SKILLS_LIST_ADMIN
      ];

      var addPermissions = UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

      var operation = new GetSkillModificationPermissionsOperation(skill.id, executingUser.id);

      var expectedPermissions: ISkillModificationPermissionsResponse = {
        canModifyPrerequisites: true,
        canModifyDependencies: true
      }

      // Act
      var executePromise = addPermissions.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for user that is not admin nor skills list admin should return correct value', () => {
      // Arrange
      var permissions: GlobalPermission[] =
        _.difference(EnumValues.getValues(GlobalPermission), [GlobalPermission.ADMIN, GlobalPermission.SKILLS_LIST_ADMIN]);

      var addPermissions = UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

      var operation = new GetSkillModificationPermissionsOperation(skill.id, executingUser.id);

      var expectedPermissions: ISkillModificationPermissionsResponse = {
        canModifyPrerequisites: false,
        canModifyDependencies: false
      }

      // Act
      var executePromise = addPermissions.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

  });

});
