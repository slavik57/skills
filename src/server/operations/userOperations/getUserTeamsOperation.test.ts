import {ITeamOfAUser} from "../../models/interfaces/iTeamOfAUser";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import {User} from "../../models/user";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetUserTeamsOperation} from './getUserTeamsOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetUserTeamsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var user: User;
    var userTeam1: Team;
    var userTeam2: Team;
    var userTeam3: Team;
    var isAdminInTeam1 = true;
    var isAdminInTeam2 = false;
    var isAdminInTeam3 = true;

    var operation: GetUserTeamsOperation;

    beforeEach(() => {
      var createUserPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => {
            [user] = _users;
          });

      var createTeamsPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(3)
          .then((_teams: Team[]) => {
            [userTeam1, userTeam2, userTeam3] = _teams;
          });

      return Promise.all([
        createUserPromise,
        createTeamsPromise
      ]).then(() => {
        return Promise.all([
          TeamsDataHandler.addTeamMember(ModelInfoMockFactory.createTeamMemberInfo(userTeam1, user, isAdminInTeam1)),
          TeamsDataHandler.addTeamMember(ModelInfoMockFactory.createTeamMemberInfo(userTeam2, user, isAdminInTeam2)),
          TeamsDataHandler.addTeamMember(ModelInfoMockFactory.createTeamMemberInfo(userTeam3, user, isAdminInTeam3))
        ]);
      }).then(() => {
        operation = new GetUserTeamsOperation(user.id);
      })
    });

    it('should return correct teams', () => {
      // Act
      var resultPromise: Promise<ITeamOfAUser[]> = operation.execute();

      // Assert
      var expectedTeams: Team[] = [userTeam1, userTeam2, userTeam3];

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUserTeams: ITeamOfAUser[]) => {
          var actualTeams: Team[] = _.map(_actualUserTeams, _ => _.team);

          ModelVerificator.verifyMultipleModelsEqualById(actualTeams, expectedTeams);
        });
    });

    it('should return correct team admin rights', () => {
      // Act
      var resultPromise: Promise<ITeamOfAUser[]> = operation.execute();

      // Assert
      var expected: ITeamOfAUser[] = [
        { team: userTeam1, isAdmin: isAdminInTeam1 },
        { team: userTeam2, isAdmin: isAdminInTeam2 },
        { team: userTeam3, isAdmin: isAdminInTeam3 }
      ]

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUserTeams: ITeamOfAUser[]) => {
          var actualUserTeamsOrdered: ITeamOfAUser[] = _.orderBy(_actualUserTeams, _ => _.team.id);
          var expectedUserTeamsOrdered: ITeamOfAUser[] = _.orderBy(expected, _ => _.team.id);

          var actualRights: boolean[] = _.map(actualUserTeamsOrdered, _ => _.isAdmin);
          var expectedRights: boolean[] = _.map(expectedUserTeamsOrdered, _ => _.isAdmin);

          expect(actualRights).to.be.deep.equal(expectedRights);
        });
    });

  });

});
