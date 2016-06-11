import {ModelVerificator} from "../../testUtils/modelVerificator";
import {Skill} from "../../models/skill";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetSkillsOperation} from './getSkillsOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetSkillsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var skills: Skill[];

    var operation: GetSkillsOperation;

    beforeEach(() => {
      var createSkillsPromise: Promise<any> =
        EnvironmentDirtifier.createSkills(4)
          .then((_skills: Skill[]) => {
            skills = _skills;
          });

      return createSkillsPromise.then(() => {
        operation = new GetSkillsOperation();
      })
    });

    it('should return correct skills', () => {
      // Act
      var resultPromise: Promise<Skill[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualSkills: Skill[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualSkills, skills);
        });
    });

  });

});
