import {GetAllowedUserPermissionsToModifyOperation} from "./getAllowedUserPermissionsToModifyOperation";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetAllowedUserPermissionsToModifyOperation', () => {

  var user: User;
  var operation: GetAllowedUserPermissionsToModifyOperation;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        user = _user;
      }).then(() => {
        operation = new GetAllowedUserPermissionsToModifyOperation(user.id)
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    it('executing user is ADMIN should return all permissions', () => {
      // Arrange
      var addPermissionsToExecutingUserPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.ADMIN]);

      // Act
      var resultPromise: Promise<GlobalPermission[]> =
        addPermissionsToExecutingUserPromise.then(() => operation.execute());

      // Assert
      var expectedPermissions: GlobalPermission[] =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      return expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
    });

    it('executing user is TEAMS_LIST_ADMIN should return correct permissions', () => {
      // Arrange
      var addPermissionsToExecutingUserPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.TEAMS_LIST_ADMIN]);

      // Act
      var resultPromise: Promise<GlobalPermission[]> =
        addPermissionsToExecutingUserPromise.then(() => operation.execute());

      // Assert
      var expectedPermissions: GlobalPermission[] =
        [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

      return expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
    });

    it('executing user is SKILLS_LIST_ADMIN should return correct permissions', () => {
      // Arrange
      var addPermissionsToExecutingUserPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.SKILLS_LIST_ADMIN]);

      // Act
      var resultPromise: Promise<GlobalPermission[]> =
        addPermissionsToExecutingUserPromise.then(() => operation.execute());

      // Assert
      var expectedPermissions: GlobalPermission[] =
        [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      return expect(resultPromise).to.eventually.deep.equal(expectedPermissions);
    });

    it('executing user is READER should return empty list', () => {
      // Arrange
      var addPermissionsToExecutingUserPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.READER]);

      // Act
      var resultPromise: Promise<GlobalPermission[]> =
        addPermissionsToExecutingUserPromise.then(() => operation.execute());

      // Assert
      var expectedPermissions: GlobalPermission[] =
        [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      return expect(resultPromise).to.eventually.deep.equal([]);
    });

    it('executing user is GUEST should return empty list', () => {
      // Arrange
      var addPermissionsToExecutingUserPromise: Promise<any> =
        UserDataHandler.addGlobalPermissions(user.id, [GlobalPermission.GUEST]);

      // Act
      var resultPromise: Promise<GlobalPermission[]> =
        addPermissionsToExecutingUserPromise.then(() => operation.execute());

      // Assert
      var expectedPermissions: GlobalPermission[] =
        [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

      return expect(resultPromise).to.eventually.deep.equal([]);
    });

  });

});
