import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {Team} from "../../models/team";
import {User} from "../../models/user";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetTeamByNameOperation} from './getTeamByNameOperation';

chai.use(chaiAsPromised);

describe('GetTeamByNameOperation', () => {

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

    describe('existing team', () => {

      var team: Team;
      var operation: GetTeamByNameOperation;

      beforeEach(() => {
        var createTeamPromise: Promise<any> =
          EnvironmentDirtifier.createTeams(1, executingUser.id)
            .then((_team: Team[]) => {
              [team] = _team;
            });

        return createTeamPromise.then(() => {
          operation = new GetTeamByNameOperation(team.attributes.name);
        })
      });

      it('should return correct team', () => {
        // Act
        var resultPromise: Promise<Team> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then((_actualTeam: Team) => {
            ModelInfoVerificator.verifyInfo(_actualTeam.attributes, team.attributes);
          });
      });

    });

    describe('not existing team', () => {

      var operation: GetTeamByNameOperation;

      beforeEach(() => {
        operation = new GetTeamByNameOperation('not existing team');
      });

      it('should return null', () => {
        // Act
        var resultPromise: Promise<Team> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then((_actualTeam: Team) => {
            expect(_actualTeam).to.not.exist;
          });
      });

    });

  });

});
