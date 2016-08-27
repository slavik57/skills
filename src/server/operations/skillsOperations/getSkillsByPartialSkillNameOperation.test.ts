import {User} from "../../models/user";
import {GetSkillsByPartialSkillNameOperation} from "./getSkillsByPartialSkillNameOperation";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {Skill} from "../../models/skill";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillsByPartialSkillNameOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var skills: Skill[];
    var skillSuffix: string;

    beforeEach(() => {
      skillSuffix = '_GetSkillsByPartialSkillNameOperation';

      return EnvironmentDirtifier.createUsers(1)
        .then((_users: User[]) => EnvironmentDirtifier.createSkills(4, _users[0].id, skillSuffix))
        .then((_skills: Skill[]) => {
          skills = _skills;
        });
    });

    it('getting by "skill2" should return correct skill', () => {
      // Arrange
      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation('skill2');

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, [skills[2]]);
        });
    });

    it('getting by "skill3" should return correct skill', () => {
      // Arrange
      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation('skill3');

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, [skills[3]]);
        });
    });

    it('getting by skillSuffix should return correct skills', () => {
      // Arrange
      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation(skillSuffix);

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
        });
    });

    it('getting by skillSuffix with null max skills should return correct skills', () => {
      // Arrange
      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation(skillSuffix, null);

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
        });
    });

    it('getting by skillSuffix with undefined max skills should return correct skills', () => {
      // Arrange
      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation(skillSuffix, undefined);

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
        });
    });

    it('getting by skillSuffix with limited number of skills to 0 should return no skills', () => {
      // Arrange
      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation(skillSuffix, 0);

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          expect(_actualSkills).to.be.length(0);
        });
    });
    it('getting by skillSuffix with limited number of skills should return correct skills', () => {
      // Arrange
      var maxNumberOfSkills = 1;

      var operation: GetSkillsByPartialSkillNameOperation =
        new GetSkillsByPartialSkillNameOperation(skillSuffix, maxNumberOfSkills);

      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          expect(_actualSkills).to.be.length(maxNumberOfSkills);

          _actualSkills.forEach((_skill) => {
            expect(_skill.attributes.name).to.contain(skillSuffix);
          });
        });
    });

  });

});
