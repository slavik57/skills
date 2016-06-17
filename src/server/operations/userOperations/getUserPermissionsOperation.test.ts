import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {User} from "../../models/user";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetUserPermissionsOperation} from './getUserPermissionsOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetUserPermissionsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var user: User;
    var permissions: GlobalPermission[];

    var operation: GetUserPermissionsOperation;

    beforeEach(() => {
      permissions = [
        GlobalPermission.ADMIN,
        GlobalPermission.TEAMS_LIST_ADMIN,
        GlobalPermission.READER
      ];

      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);

      var createUserPromise: Promise<any> =
        UserDataHandler.createUserWithPermissions(userInfo, permissions)
          .then((_user: User) => {
            user = _user;
          });

      return createUserPromise.then(() => {
        operation = new GetUserPermissionsOperation(user.id);
      })
    });

    it('should return correct permissions', () => {
      // Act
      var resultPromise: Promise<GlobalPermission[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualPermissions: GlobalPermission[]) => {
          expect(_actualPermissions.sort()).to.be.deep.equal(permissions.sort());
        });
    });

  });

});
