import {SkillPrerquisitesVerificator} from "../../testUtils/skillPrerequisitesVerificator";
import {IPrerequisitesOfASkill} from "../../models/interfaces/iPrerequisitesOfASkill";
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
import {GetSkillsPrerequisitesOperation} from './getSkillsPrerequisitesOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillsPrerequisitesOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var skills: Skill[];
    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    var skill1PrerequisitesIds: number[];
    var skill2PrerequisitesIds: number[];
    var skill3PrerequisitesIds: number[];

    var operation: GetSkillsPrerequisitesOperation;

    beforeEach(() => {

      var createSkillPrerequisitesPromise: Promise<any> =
        EnvironmentDirtifier.createSkills(3)
          .then((_skills: Skill[]) => {
            skills = _skills;
            [skill1, skill2, skill3] = _skills;
          }).then(() => Promise.all([
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill2)),
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill1, skill3)),
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skill2, skill3)),
          ])).then(() => {
            skill1PrerequisitesIds = [skill2.id, skill3.id];
            skill2PrerequisitesIds = [skill3.id];
            skill3PrerequisitesIds = [];
          });

      return createSkillPrerequisitesPromise
        .then(() => {
          operation = new GetSkillsPrerequisitesOperation();
        })
    });

    it('should return correct prerequisites succeed', () => {
      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      var expectedPrerequisites: IPrerequisitesOfASkill[] = [
        { skill: skill1, prerequisiteSkillIds: skill1PrerequisitesIds },
        { skill: skill2, prerequisiteSkillIds: skill2PrerequisitesIds },
        { skill: skill3, prerequisiteSkillIds: skill3PrerequisitesIds }
      ];

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualPrerequisites: IPrerequisitesOfASkill[]) => {
          SkillPrerquisitesVerificator.verifySkillsPrerequisites(_actualPrerequisites, expectedPrerequisites);
        });
    });

  });

});
