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

chai.use(chaiAsPromised);

describe('AddSkillOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;
    var operation: AddSkillOperation;
    var skillInfo: ISkillInfo;

    beforeEach(() => {
      skillInfo = ModelInfoMockFactory.createSkillInfo('skill');

      var userCreationPromise: Promise<any> =
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1))
          .then((_user: User) => {
            executingUser = _user;

            operation = new AddSkillOperation(executingUser.id, skillInfo);
          });

      return userCreationPromise;
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

      it('should fail and not add skill', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => SkillsDataHandler.getSkills())
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(0);
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
          .then(() => SkillsDataHandler.getSkills())
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(1);

            ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillInfo);
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
            expect(_skillsCreators).to.be.length(1);

            var expectedSkillCreatorInfo: ISkillCreatorInfo = {
              user_id: executingUser.id,
              skill_id: skill.id
            };

            ModelInfoVerificator.verifyInfo(_skillsCreators[0].attributes, expectedSkillCreatorInfo);
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
          .then(() => SkillsDataHandler.getSkills())
          .then((_skills: Skill[]) => {
            expect(_skills).to.be.length(1);

            ModelInfoVerificator.verifyInfo(_skills[0].attributes, skillInfo);
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
            expect(_skillsCreators).to.be.length(1);

            var expectedSkillCreatorInfo: ISkillCreatorInfo = {
              user_id: executingUser.id,
              skill_id: skill.id
            };

            ModelInfoVerificator.verifyInfo(_skillsCreators[0].attributes, expectedSkillCreatorInfo);
          });
      });

    });

  });

});
