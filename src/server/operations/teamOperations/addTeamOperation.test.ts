import {ErrorUtils} from "../../../common/errors/errorUtils";
import {AlreadyExistsError} from "../../../common/errors/alreadyExistsError";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {ITeamCreatorInfo} from "../../models/interfaces/iTeamCreatorInfo";
import {TeamCreator} from "../../models/teamCreator";
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
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('AddTeamOperation', () => {

  var teamInfoToAdd: ITeamInfo;
  var executingUser: User;
  var existingTeam: Team;
  var operation: AddTeamOperation;

  beforeEach(() => {
    teamInfoToAdd = ModelInfoMockFactory.createTeamInfo('team')

    return EnvironmentCleaner.clearTables()
      .then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;
      })
      .then(() => EnvironmentDirtifier.createTeams(1, executingUser.id))
      .then((_teams: Team[]) => {
        [existingTeam] = _teams;
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

      it('adding existing team should fail', () => {
        var teamInfo: ITeamInfo =
          ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);

        var operation = new AddTeamOperation(teamInfo, executingUser.id);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
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

      it('should succeed', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

      it('adding existing team should fail', () => {
        var teamInfo: ITeamInfo =
          ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);

        var operation = new AddTeamOperation(teamInfo, executingUser.id);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
          });
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
          .then(() => TeamsDataHandler.getTeamByName(teamInfoToAdd.name))
          .then((_team: Team) => {
            expect(_team).to.not.exist;
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
          .then(() => TeamsDataHandler.getTeamByName(teamInfoToAdd.name))
          .then((_team: Team) => {
            ModelInfoVerificator.verifyInfo(_team.attributes, teamInfoToAdd);
          });
      });

      it('should add the user as skill creator', () => {
        // Act
        var resultPromise: Promise<Team> = operation.execute();

        // Assert
        var team: Team;
        return expect(resultPromise).to.eventually.fulfilled
          .then((_teamm: Team) => {
            team = _teamm;
          })
          .then(() => TeamsDataHandler.getTeamsCreators())
          .then((_teamsCreators: TeamCreator[]) => {
            return _.find(_teamsCreators, _ => _.attributes.team_id === team.id);
          })
          .then((_teamsCreator: TeamCreator) => {
            var expectedTeamCreatorInfo: ITeamCreatorInfo = {
              user_id: executingUser.id,
              team_id: team.id
            };

            ModelInfoVerificator.verifyInfo(_teamsCreator.attributes, expectedTeamCreatorInfo);
          });
      });

      it('adding existing team should fail', () => {
        var teamInfo: ITeamInfo =
          ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);

        var operation = new AddTeamOperation(teamInfo, executingUser.id);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
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
          .then(() => TeamsDataHandler.getTeamByName(teamInfoToAdd.name))
          .then((_team: Team) => {
            ModelInfoVerificator.verifyInfo(_team.attributes, teamInfoToAdd);
          });
      });

      it('should add the user as team creator', () => {
        // Act
        var resultPromise: Promise<Team> = operation.execute();

        // Assert
        var team: Team;
        return expect(resultPromise).to.eventually.fulfilled
          .then((_team: Team) => {
            team = _team;
          })
          .then(() => TeamsDataHandler.getTeamsCreators())
          .then((_teamsCreators: TeamCreator[]) => {
            return _.find(_teamsCreators, _ => _.attributes.team_id === team.id);
          })
          .then((_teamsCreator: TeamCreator) => {
            var expectedTeamCreatorInfo: ITeamCreatorInfo = {
              user_id: executingUser.id,
              team_id: team.id
            };

            ModelInfoVerificator.verifyInfo(_teamsCreator.attributes, expectedTeamCreatorInfo);
          });
      });

      it('adding existing team should fail', () => {
        var teamInfo: ITeamInfo =
          ModelInfoMockFactory.createTeamInfo(existingTeam.attributes.name);

        var operation = new AddTeamOperation(teamInfo, executingUser.id);

        return expect(operation.execute()).to.eventually.rejected
          .then((_error: any) => {
            expect(ErrorUtils.isErrorOfType(_error, AlreadyExistsError)).to.be.true;
          });
      });

    });

  });

});
