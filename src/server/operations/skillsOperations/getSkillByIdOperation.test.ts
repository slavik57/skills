import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {Skill} from "../../models/skill";
import {User} from "../../models/user";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetSkillByIdOperation} from './getSkillByIdOperation';

chai.use(chaiAsPromised);

describe('GetSkillByIdOperation', () => {

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
      var operation: GetSkillByIdOperation;

      beforeEach(() => {
        var createSkillPromise: Promise<any> =
          EnvironmentDirtifier.createSkills(1, executingUser.id)
            .then((_skills: Skill[]) => {
              [skill] = _skills;
            });

        return createSkillPromise.then(() => {
          operation = new GetSkillByIdOperation(skill.id);
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

      var operation: GetSkillByIdOperation;

      beforeEach(() => {
        operation = new GetSkillByIdOperation(12321);
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
