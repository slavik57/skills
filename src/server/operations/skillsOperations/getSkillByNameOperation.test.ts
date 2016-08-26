import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {Skill} from "../../models/skill";
import {User} from "../../models/user";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetSkillByNameOperation} from './getSkillByNameOperation';

chai.use(chaiAsPromised);

describe('GetSkillByNameOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;

    beforeEach(() => {
      return EnvironmentDirtifier.createUsers(1)
        .then((_users: User[]) => {
          [executingUser] = _users;
        });
    });

    describe('existing skill', () => {

      var skill: Skill;
      var operation: GetSkillByNameOperation;

      beforeEach(() => {
        var createSkillPromise: Promise<any> =
          EnvironmentDirtifier.createSkills(1, executingUser.id)
            .then((_skill: Skill[]) => {
              [skill] = _skill;
            });

        return createSkillPromise.then(() => {
          operation = new GetSkillByNameOperation(skill.attributes.name);
        })
      });

      it('should return correct skill', () => {
        // Act
        var resultPromise: Promise<Skill> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then((_actualSkill: Skill) => {
            ModelInfoVerificator.verifyInfo(_actualSkill.attributes, skill.attributes);
          });
      });

    });

    describe('not existing skill', () => {

      var operation: GetSkillByNameOperation;

      beforeEach(() => {
        operation = new GetSkillByNameOperation('not existing skill');
      });

      it('should return null', () => {
        // Act
        var resultPromise: Promise<Skill> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then((_actualSkill: Skill) => {
            expect(_actualSkill).to.not.exist;
          });
      });

    });

  });

});
