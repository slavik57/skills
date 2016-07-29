import {GetAllowedUserPermissionsToModifyOperation} from "./getAllowedUserPermissionsToModifyOperation";
// import {ModifyUserPermissionsOperationBase} from "../base/modifyUserPermissionsOperationBase";
import {UpdateUserPermissionsOperation} from "./updateUserPermissionsOperation";
import {GlobalPermission} from "../../models/enums/globalPermission";
// import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
// import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('UpdateUserPermissionsOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('add permissions', () => {

    var userToModifyPermissionsOf: User;
    var executingUser: User;

    beforeEach(() => {
      return Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
      ]).then((_users: User[]) => {
        [executingUser, userToModifyPermissionsOf] = _users;
      });
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
            });
        });

        it('adding READER permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding GUEST permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding all permissions the user can add should add them all', () => {
          // Arrange
          var permissionsToAdd: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToAdd = _permissions;

                operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
                  permissionsToAdd,
                  [],
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert

          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
            })
        });

        it('adding SKILLS_LIST_ADMIN permissions should fail and not add the permissions', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal([]);
            });
        });

        it('adding READER permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding GUEST permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding all permissions the user can add should add them all', () => {
          // Arrange
          var permissionsToAdd: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToAdd = _permissions;

                operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
                  permissionsToAdd,
                  [],
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
            })
        });

        it('adding TEAMS_LIST_ADMIN permissions should fail and not add the permissions', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal([]);
            });
        });

        it('adding READER permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding GUEST permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding all permissions the user can add should add them all', () => {
          // Arrange
          var permissionsToAdd: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToAdd = _permissions;

                operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
                  permissionsToAdd,
                  [],
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal([]);
            });
        });

        it('adding READER permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding GUEST permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding all permissions the user can add should add them all', () => {
          // Arrange
          var permissionsToAdd: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToAdd = _permissions;

                operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
                  permissionsToAdd,
                  [],
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
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

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal([]);
            });
        });

        it('adding READER permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding GUEST permissions should fail and not add', () => {
          // Arrange
          var permissionsToAdd = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
            permissionsToAdd,
            [],
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions).to.be.deep.equal([]);
            });
        });

        it('adding all permissions the user can add should add them all', () => {
          // Arrange
          var permissionsToAdd: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToAdd = _permissions;

                operation = new UpdateUserPermissionsOperation(userToModifyPermissionsOf.id,
                  permissionsToAdd,
                  [],
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToModifyPermissionsOf.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(permissionsToAdd.sort());
            });
        });

      });

    });

  });

  describe('remove permissions', () => {

    var userToRemovePermissionsFrom: User;
    var userPermissionsBeforeRemoval: GlobalPermission[];
    var minimalUserPermissionsToRemain: GlobalPermission[];
    var executingUser: User;

    beforeEach(() => {
      userPermissionsBeforeRemoval =
        [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

      minimalUserPermissionsToRemain =
        [
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

      return Promise.all([
        UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
        UserDataHandler.createUserWithPermissions(ModelInfoMockFactory.createUserInfo(2), userPermissionsBeforeRemoval)
      ]).then((_users: User[]) => {
        [executingUser, userToRemovePermissionsFrom] = _users;
      });
    });

    describe('execute', () => {

      describe('executing user is ADMIN', () => {

        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
        });

        it('removing all permissions should remove all', () => {
          // Arrange
          var permissionsToRemove: GlobalPermission[] =
            _.difference(userPermissionsBeforeRemoval, minimalUserPermissionsToRemain);

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(minimalUserPermissionsToRemain);
            });
        });

        it('removing READER permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing GUEST permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing all permissions the user can remove should remove them all', () => {
          // Arrange
          var permissionsToRemove: GlobalPermission[];
          var expectedPermissions: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToRemove = _permissions;
                expectedPermissions = _.difference(userPermissionsBeforeRemoval, permissionsToRemove);

                operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
                  [],
                  permissionsToRemove,
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });

      });

      describe('executing user is TEAMS_LIST_ADMIN', () => {

        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.TEAMS_LIST_ADMIN]);
        });

        it('removing TEAMS_LIST_ADMIN permissions should succeed', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          var expectedPermissions: GlobalPermission[] = _.difference(userPermissionsBeforeRemoval, permissionsToRemove);

          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            })
        });

        it('removing SKILLS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing READER permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing GUEST permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing all permissions the user can remove should remove them all', () => {
          // Arrange
          var permissionsToRemove: GlobalPermission[];
          var expectedPermissions: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToRemove = _permissions;
                expectedPermissions = _.difference(userPermissionsBeforeRemoval, permissionsToRemove);

                operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
                  [],
                  permissionsToRemove,
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });

      });

      describe('executing user is SKILLS_LIST_ADMIN', () => {

        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.SKILLS_LIST_ADMIN]);
        });

        it('removing SKILLS_LIST_ADMIN permissions should succeed', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          var expectedPermissions: GlobalPermission[] = _.difference(userPermissionsBeforeRemoval, permissionsToRemove);

          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });

        it('removing TEAMS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing READER permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing GUEST permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing all permissions the user remove add should remove them all', () => {
          // Arrange
          var permissionsToRemove: GlobalPermission[];
          var expectedPermissions: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToRemove = _permissions;
                expectedPermissions = _.difference(userPermissionsBeforeRemoval, permissionsToRemove);

                operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
                  [],
                  permissionsToRemove,
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });

      });

      describe('executing user is READER', () => {

        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.READER]);
        });

        it('removing TEAMS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing READER permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing GUEST permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing all permissions the user can remove should remove them all', () => {
          // Arrange
          var permissionsToRemove: GlobalPermission[];
          var expectedPermissions: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToRemove = _permissions;
                expectedPermissions = _.difference(userPermissionsBeforeRemoval, permissionsToRemove);

                operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
                  [],
                  permissionsToRemove,
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });

      });

      describe('executing user is GUEST', () => {

        beforeEach(() => {
          return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.GUEST]);
        });

        it('removing TEAMS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing TEAMS_LIST_ADMIN and SKILLS_LIST_ADMIN permissions should fail and not remove the permissions', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.TEAMS_LIST_ADMIN,
            GlobalPermission.SKILLS_LIST_ADMIN
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval);
            });
        });

        it('removing READER permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.READER
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing GUEST permissions should fail and not remove', () => {
          // Arrange
          var permissionsToRemove = [
            GlobalPermission.GUEST
          ];

          var operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
            [],
            permissionsToRemove,
            executingUser.id);

          // Act
          var resultPromise: Promise<any> = operation.execute();

          // Assert
          return expect(resultPromise).to.eventually.rejected
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(userPermissionsBeforeRemoval.sort());
            });
        });

        it('removing all permissions the user can remove should remove them all', () => {
          // Arrange
          var permissionsToRemove: GlobalPermission[];
          var expectedPermissions: GlobalPermission[];
          var operation: UpdateUserPermissionsOperation;

          var permissionsToAddPromise: Promise<any> =
            new GetAllowedUserPermissionsToModifyOperation(executingUser.id).execute()
              .then((_permissions: GlobalPermission[]) => {
                permissionsToRemove = _permissions;
                expectedPermissions = _.difference(userPermissionsBeforeRemoval, permissionsToRemove)

                operation = new UpdateUserPermissionsOperation(userToRemovePermissionsFrom.id,
                  [],
                  permissionsToRemove,
                  executingUser.id);
              });

          // Act
          var resultPromise: Promise<any> =
            permissionsToAddPromise.then(() => operation.execute());

          // Assert
          return expect(resultPromise).to.eventually.fulfilled
            .then(() => UserDataHandler.getUserGlobalPermissions(userToRemovePermissionsFrom.id))
            .then((_actualPermissions: GlobalPermission[]) => {
              expect(_actualPermissions.sort()).to.be.deep.equal(expectedPermissions.sort());
            });
        });

      });

    });

  });

});
