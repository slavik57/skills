import {ModifyUserPermissionsOperationBase} from "./base/modifyUserPermissionsOperationBase";
import {AddUserPermissionOperation} from "./addUserPermissionOperation";
import {GlobalPermission} from "../models/enums/globalPermission";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoVerificator} from "../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('AddUserPermissionOperation', () => {

  var userToAddPermissionsTo: User;
  var executingUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
      ])).then((_users: User[]) => {
        [executingUser, userToAddPermissionsTo] = _users;
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('executing user is ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
      });

      it('adding all permissions should add all', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          });
      });

      it('adding READER permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.READER
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding GUEST permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.GUEST
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding all permissions the user can add should add them all', () => {
        // Arrange
        var permissionsToAdd: GlobalPermission[];
        var operation: AddUserPermissionOperation;

        var permissionsToAddPromise: Promise<any> =
          ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(executingUser.id)
            .then((_permissions: GlobalPermission[]) => {
              permissionsToAdd = _permissions;

              operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
                permissionsToAdd,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToAddPromise.then(() => operation.execute());

        // Assert

        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          });
      });

    });

    describe('executing user is TEAMS_LIST_ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
      });

      it('adding TEAMS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          })
      });

      it('adding SKILLS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding READER permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.READER
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding GUEST permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.GUEST
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding all permissions the user can add should add them all', () => {
        // Arrange
        var permissionsToAdd: GlobalPermission[];
        var operation: AddUserPermissionOperation;

        var permissionsToAddPromise: Promise<any> =
          ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(executingUser.id)
            .then((_permissions: GlobalPermission[]) => {
              permissionsToAdd = _permissions;

              operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
                permissionsToAdd,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToAddPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          });
      });

    });

    describe('executing user is SKILLS_LIST_ADMIN', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
      });

      it('adding SKILLS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          })
      });

      it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding READER permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.READER
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding GUEST permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.GUEST
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding all permissions the user can add should add them all', () => {
        // Arrange
        var permissionsToAdd: GlobalPermission[];
        var operation: AddUserPermissionOperation;

        var permissionsToAddPromise: Promise<any> =
          ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(executingUser.id)
            .then((_permissions: GlobalPermission[]) => {
              permissionsToAdd = _permissions;

              operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
                permissionsToAdd,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToAddPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          });
      });

    });

    describe('executing user is READER', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.READER]);
      });

      it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding READER permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.READER
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding GUEST permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.GUEST
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding all permissions the user can add should add them all', () => {
        // Arrange
        var permissionsToAdd: GlobalPermission[];
        var operation: AddUserPermissionOperation;

        var permissionsToAddPromise: Promise<any> =
          ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(executingUser.id)
            .then((_permissions: GlobalPermission[]) => {
              permissionsToAdd = _permissions;

              operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
                permissionsToAdd,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToAddPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          });
      });

    });

    describe('executing user is GUEST', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.GUEST]);
      });

      it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not add the permissions', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal([]);
          });
      });

      it('adding READER permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.READER
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding GUEST permissions should fail and not add', () => {
        // Arrange
        var permissionsToAdd = [
          GlobalPermission.GUEST
        ];

        var operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
          permissionsToAdd,
          executingUser.id);

        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions).to.be.deep.equal([]);
          });
      });

      it('adding all permissions the user can add should add them all', () => {
        // Arrange
        var permissionsToAdd: GlobalPermission[];
        var operation: AddUserPermissionOperation;

        var permissionsToAddPromise: Promise<any> =
          ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(executingUser.id)
            .then((_permissions: GlobalPermission[]) => {
              permissionsToAdd = _permissions;

              operation = new AddUserPermissionOperation(userToAddPermissionsTo.id,
                permissionsToAdd,
                executingUser.id);
            });

        // Act
        var resultPromise: Promise<any> =
          permissionsToAddPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => UserDataHandler.getUserGlobalPermissions(userToAddPermissionsTo.id))
          .then((_actualPermissions: GlobalPermission[]) => {
            expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
          });
      });

    });

  });

});
