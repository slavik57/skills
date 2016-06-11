import {ModelVerificator} from "../../testUtils/modelVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {SkillPrerequisite} from "../../models/skillPrerequisite";
import {Skill} from "../../models/skill";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetSkillPrerequisitesOperation} from './getSkillPrerequisitesOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillPrerequisitesOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var skill: Skill;
    var skillPrerequisite1: Skill;
    var skillPrerequisite2: Skill;
    var skillPrerequisite3: Skill;

    var operation: GetSkillPrerequisitesOperation;

    beforeEach(() => {

      var createSkillPrerequisitesPromise: Promise<any> =
        EnvironmentDirtifier.createSkills(4)
          .then((_skills: Skill[]) => {
            [skill, skillPrerequisite1, skillPrerequisite2, skillPrerequisite3] = _skills;
          }).then(() => Promise.all([
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite1)),
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite2)),
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill, skillPrerequisite3))
          ]));

      return createSkillPrerequisitesPromise
        .then(() => {
          operation = new GetSkillPrerequisitesOperation(skill.id);
        })
    });

    it('should return correct prerequisites succeed', () => {
      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      var expectedPrerequisites = [skillPrerequisite1, skillPrerequisite2, skillPrerequisite3];

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualPrerequisites: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualPrerequisites, expectedPrerequisites);
        });
    });

  });

});
