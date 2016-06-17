import {IUserOfATeam} from "../../models/interfaces/iUserOfATeam";
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
import {GetTeamUsersOperation} from './getTeamUsersOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetTeamUsersOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var team: Team;
    var teamUser1: User;
    var teamUser2: User;
    var teamUser3: User;
    var isUser1Admin = true;
    var isUser2Admin = false;
    var isUser3Admin = true;

    var operation: GetTeamUsersOperation;

    beforeEach(() => {
      var createTeamPromise: Promise<any> =
        EnvironmentDirtifier.createTeams(1)
          .then((_teams: Team[]) => {
            [team] = _teams;
          });

      var createUsersPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(3)
          .then((_users: User[]) => {
            [teamUser1, teamUser2, teamUser3] = _users;
          });

      return Promise.all([
        createTeamPromise,
        createUsersPromise
      ]).then(() => {
        return Promise.all([
          TeamsDataHandler.addTeamMember(ModelInfoMockFactory.createTeamMemberInfo(team, teamUser1, isUser1Admin)),
          TeamsDataHandler.addTeamMember(ModelInfoMockFactory.createTeamMemberInfo(team, teamUser2, isUser2Admin)),
          TeamsDataHandler.addTeamMember(ModelInfoMockFactory.createTeamMemberInfo(team, teamUser3, isUser3Admin))
        ]);
      }).then(() => {
        operation = new GetTeamUsersOperation(team.id);
      })
    });

    it('should return correct users', () => {
      // Act
      var resultPromise: Promise<IUserOfATeam[]> = operation.execute();

      // Assert
      var expectedUsers: User[] = [teamUser1, teamUser2, teamUser3];

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualTeamUsers: IUserOfATeam[]) => {
          var actualUsers: User[] = _.map(_actualTeamUsers, _ => _.user);

          ModelVerificator.verifyMultipleModelsEqualById(actualUsers, expectedUsers);
        });
    });

    it('should return correct team admin rights', () => {
      // Act
      var resultPromise: Promise<IUserOfATeam[]> = operation.execute();

      // Assert
      var expected: IUserOfATeam[] = [
        { user: teamUser1, isAdmin: isUser1Admin },
        { user: teamUser2, isAdmin: isUser2Admin },
        { user: teamUser3, isAdmin: isUser3Admin }
      ]

      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualTeamUsers: IUserOfATeam[]) => {
          var actualTeamUsersOrdered: IUserOfATeam[] = _.orderBy(_actualTeamUsers, _ => _.user.id);
          var expectedTeamUsersOrdered: IUserOfATeam[] = _.orderBy(expected, _ => _.user.id);

          var actualRights: boolean[] = _.map(actualTeamUsersOrdered, _ => _.isAdmin);
          var expectedRights: boolean[] = _.map(expectedTeamUsersOrdered, _ => _.isAdmin);

          expect(actualRights).to.be.deep.equal(expectedRights);
        });
    });

  });

});
