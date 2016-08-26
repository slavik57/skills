import {GlobalPermission} from "../../models/enums/globalPermission";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {ITeamModificationPermissionsResponse} from "../../apiResponses/iTeamModificationPermissionsResponse";
import {ITeamMemberInfo} from "../../models/interfaces/iTeamMemberInfo";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {NotFoundError} from "../../../common/errors/notFoundError";
import {ErrorUtils} from "../../../common/errors/errorUtils";
import {Team} from "../../models/team";
import {User} from "../../models/user";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetTeamModificationPermissionsOperation} from './getTeamModificationPermissionsOperation';
import {EnumValues} from 'enum-values';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetTeamModificationPermissionsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var executingUser: User;
    var team: Team;
    var otherTeam: Team;

    beforeEach(() => {
      return EnvironmentDirtifier.createUsers(1)
        .then((_users: User[]) => {
          [executingUser] = _users;
        })
        .then(() => EnvironmentDirtifier.createTeams(2, executingUser.id))
        .then((_teams: Team[]) => {
          [team, otherTeam] = _teams;
        });
    });

    it('not existing team should reject correctly', () => {
      var operation = new GetTeamModificationPermissionsOperation(123321, executingUser.id);

      return expect(operation.execute()).to.eventually.rejected
        .then((_error: any) => {
          expect(ErrorUtils.isErrorOfType(_error, NotFoundError)).to.be.true;
        });
    });

    it('not existing user should reject correctly', () => {
      var operation = new GetTeamModificationPermissionsOperation(team.id, 1232123);

      return expect(operation.execute()).to.eventually.rejected
        .then((_error: any) => {
          expect(ErrorUtils.isErrorOfType(_error, NotFoundError)).to.be.true;
        });
    });

    it('for regular team user should return correct value', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = {
        team_id: team.id,
        user_id: executingUser.id,
        is_admin: false
      };

      var addTeamMemberPromise = TeamsDataHandler.addTeamMember(teamMemberInfo);

      var operation = new GetTeamModificationPermissionsOperation(team.id, executingUser.id);

      var expectedPermissions: ITeamModificationPermissionsResponse = {
        canModifyTeamName: false,
        canModifyTeamAdmins: false,
        canModifyTeamUsers: false
      }

      // Act
      var executePromise = addTeamMemberPromise.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for team admin should return correct value', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = {
        team_id: team.id,
        user_id: executingUser.id,
        is_admin: true
      };

      var addTeamMemberPromise = TeamsDataHandler.addTeamMember(teamMemberInfo);

      var operation = new GetTeamModificationPermissionsOperation(team.id, executingUser.id);

      var expectedPermissions: ITeamModificationPermissionsResponse = {
        canModifyTeamName: true,
        canModifyTeamAdmins: true,
        canModifyTeamUsers: true
      }

      // Act
      var executePromise = addTeamMemberPromise.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for other team admin should return correct value', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = {
        team_id: otherTeam.id,
        user_id: executingUser.id,
        is_admin: true
      };

      var addTeamMemberPromise = TeamsDataHandler.addTeamMember(teamMemberInfo);

      var operation = new GetTeamModificationPermissionsOperation(team.id, executingUser.id);

      var expectedPermissions: ITeamModificationPermissionsResponse = {
        canModifyTeamName: false,
        canModifyTeamAdmins: false,
        canModifyTeamUsers: false
      }

      // Act
      var executePromise = addTeamMemberPromise.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for admin should return correct value', () => {
      // Arrange
      var permissions: GlobalPermission[] = [
        GlobalPermission.ADMIN
      ];

      var addPermissions = UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

      var operation = new GetTeamModificationPermissionsOperation(team.id, executingUser.id);

      var expectedPermissions: ITeamModificationPermissionsResponse = {
        canModifyTeamName: true,
        canModifyTeamAdmins: true,
        canModifyTeamUsers: true
      }

      // Act
      var executePromise = addPermissions.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for teams list admin should return correct value', () => {
      // Arrange
      var permissions: GlobalPermission[] = [
        GlobalPermission.TEAMS_LIST_ADMIN
      ];

      var addPermissions = UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

      var operation = new GetTeamModificationPermissionsOperation(team.id, executingUser.id);

      var expectedPermissions: ITeamModificationPermissionsResponse = {
        canModifyTeamName: true,
        canModifyTeamAdmins: true,
        canModifyTeamUsers: true
      }

      // Act
      var executePromise = addPermissions.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

    it('for user that is not admin nor teams list admin should return correct value', () => {
      // Arrange
      var permissions: GlobalPermission[] =
        _.difference(EnumValues.getValues(GlobalPermission), [GlobalPermission.ADMIN, GlobalPermission.TEAMS_LIST_ADMIN]);

      var addPermissions = UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

      var operation = new GetTeamModificationPermissionsOperation(team.id, executingUser.id);

      var expectedPermissions: ITeamModificationPermissionsResponse = {
        canModifyTeamName: false,
        canModifyTeamAdmins: false,
        canModifyTeamUsers: false
      }

      // Act
      var executePromise = addPermissions.then(() => operation.execute());

      // Assert
      return expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
    });

  });

});
