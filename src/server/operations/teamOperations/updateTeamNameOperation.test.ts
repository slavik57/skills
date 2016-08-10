import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team} from "../../models/team";
import {UpdateTeamNameOperation} from "./updateTeamNameOperation";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

describe('UpdateTeamNameOperation', () => {

  var executingUser: User;
  var team: Team;
  var otherTeam: Team;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => EnvironmentDirtifier.createUsers(1))
      .then((_users: User[]) => {
        [executingUser] = _users;
      })
      .then(() => EnvironmentDirtifier.createTeams(2, executingUser.id))
      .then((_teams: Team[]) => {
        [team, otherTeam] = _teams;
      })
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('on invalid team name', () => {

      var operation: UpdateTeamNameOperation;

      beforeEach(() => {
        operation = new UpdateTeamNameOperation(team.id,
          '',
          executingUser.id);
      });

      it('should fail execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
      });

      it('should not update the team', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeam(team.id))
          .then((_team: Team) => {
            ModelInfoVerificator.verifyInfo(_team.attributes, team.attributes);
          });
      });

    });

    describe('on valid team name', () => {

      var operation: UpdateTeamNameOperation;
      var newTeamName: string;

      beforeEach(() => {
        newTeamName = 'new team name';

        operation = new UpdateTeamNameOperation(
          team.id,
          newTeamName,
          executingUser.id);
      });

      describe('user without needed permissions', () => {

        beforeEach(() => {
          var permissions: GlobalPermission[] = [
            GlobalPermission.SKILLS_LIST_ADMIN,
            GlobalPermission.READER,
            GlobalPermission.GUEST
          ];

          var teamMemberInfo: ITeamMemberInfo = {
            team_id: team.id,
            user_id: executingUser.id,
            is_admin: false
          };

          return bluebirdPromise.all([
            TeamsDataHandler.addTeamMember(teamMemberInfo),
            UserDataHandler.addGlobalPermissions(executingUser.id, permissions)
          ]);
        });

        it('should fail', () => {
          return expect(operation.execute()).to.eventually.rejected;
        });

        it('should not update the team name', () => {
          return TeamsDataHandler.getTeam(team.id)
            .then((_team: Team) => {
              ModelInfoVerificator.verifyInfo(_team.attributes, team.attributes);
            });
        });

      });

      var onSufficientPermissions = (beforeEachFunc: () => any) => {
        return () => {
          beforeEach(beforeEachFunc);

          it('should succeed execution', () => {
            // Act
            var result: Promise<any> = operation.execute();

            // Assert
            return expect(result).to.eventually.fulfilled;
          });

          it('should update the team name', () => {
            // Act
            var result: Promise<any> = operation.execute();

            // Assert
            return expect(result).to.eventually.fulfilled
              .then(() => TeamsDataHandler.getTeam(team.id))
              .then((_team: Team) => {
                expect(_team.attributes.name).to.be.equal(newTeamName);
              });
          });

          it('should return the team', () => {
            // Act
            var result: Promise<Team> = operation.execute();

            // Assert
            return expect(result).to.eventually.fulfilled
              .then((_team: Team) => {
                expect(_team.id).to.be.equal(team.id);
                expect(_team.attributes.name).to.be.equal(newTeamName);
              });
          });

          it('with same team name should succeed', () => {
            // Arrange
            var updateUserDetailsOperation = new UpdateTeamNameOperation(
              team.id,
              team.attributes.name,
              executingUser.id);

            // Act
            var result: Promise<any> = updateUserDetailsOperation.execute()
              .then(() => operation.execute());

            // Assert
            return expect(result).to.eventually.fulfilled;
          });

          it('with existing team name should fail', () => {
            // Arrange
            var updateUserDetailsOperation = new UpdateTeamNameOperation(
              team.id,
              otherTeam.attributes.name,
              executingUser.id);

            // Act
            var result: Promise<any> = updateUserDetailsOperation.execute()
              .then(() => operation.execute());

            // Assert
            var expectedError = new AlreadyExistsError();
            expectedError.message = 'The team name is taken';

            return expect(result).to.eventually.rejected
              .then((error: any) => {
                expect(error).to.deep.equal(expectedError);
              });
          });

        }
      }

      describe('user is admin',
        onSufficientPermissions(() => {
          var permissions: GlobalPermission[] = [
            GlobalPermission.ADMIN
          ];

          return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
        })
      );

      describe('user is team list admin',
        onSufficientPermissions(() => {
          var permissions: GlobalPermission[] = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
        })
      );

      describe('user is team admin',
        onSufficientPermissions(() => {
          var teamMemberInfo: ITeamMemberInfo = {
            team_id: team.id,
            user_id: executingUser.id,
            is_admin: true
          };

          return TeamsDataHandler.addTeamMember(teamMemberInfo);
        })
      );

    });

  })

});
