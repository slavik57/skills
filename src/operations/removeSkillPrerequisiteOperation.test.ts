import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
import {Skill} from "../models/skill";
import {SkillsDataHandler} from "../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {GlobalPermission} from "../models/enums/globalPermission";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {RemoveSkillPrerequisiteOperation} from './removeSkillPrerequisiteOperation';

chai.use(chaiAsPromised);

describe('RemoveSkillPrerequisiteOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;
    var operation: RemoveSkillPrerequisiteOperation;
    var skill: Skill;
    var skillPrerequisite: Skill;

    beforeEach(() => {
      var userCreationPromise: Promise<any> =
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
          .then((_user: User) => {
            executingUser = _user;
          });

      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skill');
      var skillPrerequisiteInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skillPrerequisite');

      var createSkillPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo),
          SkillsDataHandler.createSkill(skillPrerequisiteInfo)
        ]).then((_skills: Skill[]) => {
          [skill, skillPrerequisite] = _skills;

          operation = new RemoveSkillPrerequisiteOperation(skill.id, skillPrerequisite.id, executingUser.id);
        });

      return Promise.all(
        [
          userCreationPromise,
          createSkillPromise
        ]
      ).then(() => {
        return SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite));
      });
    });

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail and not remove prerequisite', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => SkillsDataHandler.getSkillPrerequisites(skill.id))
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(1);

            ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillPrerequisite.attributes);
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

      it('should succeed and remove prerequisite', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => SkillsDataHandler.getSkillPrerequisites(skill.id))
          .then((_skillPrerequisites: Skill[]) => {
            expect(_skillPrerequisites).to.be.length(0);
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

      it('should succeed and remove prerequisite', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => SkillsDataHandler.getSkillPrerequisites(skill.id))
          .then((_skillPrerequisites: Skill[]) => {
            expect(_skillPrerequisites).to.be.length(0);
          });
      });

    });

  });

});
