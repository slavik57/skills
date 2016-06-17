import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ITeamInfo} from "../../models/interfaces/iTeamInfo";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {AddTeamOperation} from "./addTeamOperation";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {Team, Teams} from "../../models/team";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {Collection} from 'bookshelf';

chai.use(chaiAsPromised);

describe('AddTeamOperation', () => {

  var teamInfoToAdd: ITeamInfo;
  var executingUser: User;
  var operation: AddTeamOperation;

  beforeEach(() => {
    teamInfoToAdd = ModelInfoMockFactory.createTeamInfo('team')

    return EnvironmentCleaner.clearTables()
      .then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;
      })
      .then(() => {
        operation = new AddTeamOperation(teamInfoToAdd, executingUser.id);
      })
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('canExecute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

    describe('executing user is TEAMS_LIST_ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

  });

  describe('execute', () => {

    describe('executing user has insufficient global permissions', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should fail and not add team', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => new Teams().fetch())
          .then((_teamsCollection: Collection<Team>) => _teamsCollection.toArray())
          .then((_teams: Team[]) => {
            expect(_teams).to.be.length(0);
          });
      });

    });

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed and add team', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => new Teams().fetch())
          .then((_teamsCollection: Collection<Team>) => _teamsCollection.toArray())
          .then((_teams: Team[]) => {
            expect(_teams).to.be.length(1);

            ModelInfoVerificator.verifyInfo(_teams[0].attributes, teamInfoToAdd);
          });
      });

    });

    describe('executing user is TEAMS_LIST_ADMIN', () => {

      beforeEach(() => {
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        return UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
      });

      it('should succeed and add team', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => new Teams().fetch())
          .then((_teamsCollection: Collection<Team>) => _teamsCollection.toArray())
          .then((_teams: Team[]) => {
            expect(_teams).to.be.length(1);

            ModelInfoVerificator.verifyInfo(_teams[0].attributes, teamInfoToAdd);
          });
      });

    });

  });

});
