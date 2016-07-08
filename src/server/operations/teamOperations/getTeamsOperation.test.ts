import {User} from "../../models/user";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {Team} from "../../models/team";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetTeamsOperation} from './getTeamsOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetTeamsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var teams: Team[];

    var operation: GetTeamsOperation;

    beforeEach(() => {
      var createTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => EnvironmentDirtifier.createTeams(4, _users[0].id))
          .then((_teams: Team[]) => {
            teams = _teams;
          });

      return createTeamsPromise.then(() => {
        operation = new GetTeamsOperation();
      })
    });

    it('should return correct teams', () => {
      // Act
      var resultPromise: Promise<Team[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualTeams: Team[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualTeams, teams);
        });
    });

  });

});
