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
import {RemoveSkillOperation} from './removeSkillInfoOperation';

chai.use(chaiAsPromised);

describe('RemoveSkillOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;
    var operation: RemoveSkillOperation;
    var skillToRemove: Skill;

    beforeEach(() => {
      var userCreationPromise: Promise<any> =
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
          .then((_user: User) => {
            executingUser = _user;

          });

      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo('skill');

      var createSkillPromise: Promise<any> =
        SkillsDataHandler.createSkill(skillInfo)
          .then((_skill) => {
            skillToRemove = _skill;

            operation = new RemoveSkillOperation(executingUser.id, skillToRemove.id);
          });

      return Promise.all(
        [
          userCreationPromise,
          createSkillPromise
        ]
      );
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

      it('should fail and not remove skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => SkillsDataHandler.getSkills())
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(1);

            expect(_skills[0].id).to.be.equal(skillToRemove.id);
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

      it('should succeed and remove skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => SkillsDataHandler.getSkills())
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(0);
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

      it('should succeed and remove skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => SkillsDataHandler.getSkills())
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(0);
          });
      });

    });

  });

});
