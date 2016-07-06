import {User} from "../../models/user";
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
import {GetSkillContributionsOperation} from './getSkillContributionsOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillContributionsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var skill: Skill;
    var skillContribution1: Skill;
    var skillContribution2: Skill;
    var skillContribution3: Skill;

    var operation: GetSkillContributionsOperation;

    beforeEach(() => {

      var createSkillContributionsPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => EnvironmentDirtifier.createSkills(4, _users[0].id))
          .then((_skills: Skill[]) => {
            [skill, skillContribution1, skillContribution2, skillContribution3] = _skills;
          }).then(() => Promise.all([
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skillContribution1, skill)),
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skillContribution2, skill)),
            SkillsDataHandler.addSkillPrerequisite(ModelInfoMockFactory.createSkillPrerequisiteInfo(skillContribution3, skill))
          ]));

      return createSkillContributionsPromise
        .then(() => {
          operation = new GetSkillContributionsOperation(skill.id);
        })
    });

    it('should return correct contributions succeed', () => {
      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      var expectedContributions = [skillContribution1, skillContribution2, skillContribution3];

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualContributions: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualContributions, expectedContributions);
        });
    });

  });

});
