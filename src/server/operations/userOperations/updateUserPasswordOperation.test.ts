import {ErrorUtils} from "../../../common/errors/errorUtils";
import {UnauthorizedError} from "../../../common/errors/unauthorizedError";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {UpdateUserPasswordOperation} from "./updateUserPasswordOperation";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
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
import * as passwordHash from 'password-hash';

chai.use(chaiAsPromised);

describe('UpdateUserPasswordOperation', () => {

  var userInfo: IUserInfo;
  var otherUserInfo: IUserInfo;
  var user: User;
  var otherUser: User;
  var userPassword: string;
  var otherUserPassword: string;

  beforeEach(() => {
    userPassword = 'some password';
    otherUserPassword = 'some other password';

    return EnvironmentCleaner.clearTables()
      .then(() => {
        userInfo = ModelInfoMockFactory.createUserInfo(1);
        otherUserInfo = ModelInfoMockFactory.createUserInfo(2);

        userInfo.password_hash = passwordHash.generate(userPassword);
        otherUserInfo.password_hash = passwordHash.generate(otherUserPassword);
      })
      .then(() => Promise.all([
        UserDataHandler.createUser(userInfo),
        UserDataHandler.createUser(otherUserInfo),
      ]))
      .then((_users: User[]) => {
        [user, otherUser] = _users;
      })
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('on not existing user id', () => {

      var operation: UpdateUserPasswordOperation;

      beforeEach(() => {
        var id = user.id + otherUser.id + 9999;
        operation = new UpdateUserPasswordOperation(
          id,
          userPassword,
          'new password',
          id);
      });

      it('should fail execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then((error) => {
            expect(error).to.be.equal('Something went wrong')
          });
      });

    });

    describe('on wrong password', () => {

      var operation: UpdateUserPasswordOperation;

      beforeEach(() => {
        operation = new UpdateUserPasswordOperation(
          user.id,
          userPassword + 1,
          'new password',
          user.id);
      });

      it('should fail execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then((error) => {
            expect(error).to.be.equal('Wrong password')
          });
      });

      it('should not update the user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            ModelInfoVerificator.verifyInfo(_user.attributes, user.attributes);
          });
      });

    });

    describe('on empty new password', () => {

      var operation: UpdateUserPasswordOperation;

      beforeEach(() => {
        operation = new UpdateUserPasswordOperation(
          user.id,
          userPassword,
          '',
          user.id);
      });

      it('should fail execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then((error) => {
            expect(error).to.be.equal('The new password cannot be empty');
          });
      });

      it('should not update the user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            ModelInfoVerificator.verifyInfo(_user.attributes, user.attributes);
          });
      });

    });

    describe('on valid user info', () => {

      var newPassword: string;

      beforeEach(() => {
        newPassword = 'some new password for the user';
      });

      describe('on same user executing', () => {
        var operation: UpdateUserPasswordOperation;

        beforeEach(() => {
          newPassword = 'some new password for the user';

          operation = new UpdateUserPasswordOperation(
            user.id,
            userPassword,
            newPassword,
            user.id);
        });

        it('should succeed execution', () => {
          // Act
          var result: Promise<any> = operation.execute();

          // Assert
          return expect(result).to.eventually.fulfilled;
        });

        it('should update the user password', () => {
          // Act
          var result: Promise<any> = operation.execute();

          // Assert
          return expect(result).to.eventually.fulfilled
            .then(() => UserDataHandler.getUser(user.id))
            .then((_user: User) => {
              expect(passwordHash.verify(newPassword, _user.attributes.password_hash)).to.be.true;
            });
        });

      });

      describe('on other user executing', () => {
        var operation: UpdateUserPasswordOperation;
        var executingUser: User;

        beforeEach(() => {
          newPassword = 'some new password for the user';

          return UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(33))
            .then((_user: User) => {
              executingUser = _user;
            })
            .then(() => {
              operation = new UpdateUserPasswordOperation(
                user.id,
                userPassword,
                newPassword,
                executingUser.id);
            });
        });

        it('should fail execution', () => {
          // Act
          var result: Promise<any> = operation.execute();

          // Assert
          return expect(result).to.eventually.rejected
            .then((error) => {
              expect(ErrorUtils.IsUnautorizedError(error)).to.be.true;
            });
        });

        it('should not update the user', () => {
          // Act
          var result: Promise<any> = operation.execute();

          // Assert
          return expect(result).to.eventually.rejected
            .then(() => UserDataHandler.getUser(user.id))
            .then((_user: User) => {
              ModelInfoVerificator.verifyInfo(_user.attributes, user.attributes);
            });
        });

        describe('other user is admin', () => {

          beforeEach(() => {
            return UserDataHandler.addGlobalPermissions(executingUser.id, [GlobalPermission.ADMIN]);
          });

          it('should succeed execution', () => {
            // Act
            var result: Promise<any> = operation.execute();

            // Assert
            return expect(result).to.eventually.fulfilled;
          });

          it('should update the user password', () => {
            // Act
            var result: Promise<any> = operation.execute();

            // Assert
            return expect(result).to.eventually.fulfilled
              .then(() => UserDataHandler.getUser(user.id))
              .then((_user: User) => {
                expect(passwordHash.verify(newPassword, _user.attributes.password_hash)).to.be.true;
              });
          });

          describe('on wrong password', () => {

            var operation: UpdateUserPasswordOperation;
            var newPassword: string;

            beforeEach(() => {
              newPassword = 'new password';

              operation = new UpdateUserPasswordOperation(
                user.id,
                'wrong password',
                newPassword,
                executingUser.id);
            });

            it('should succeed execution', () => {
              // Act
              var result: Promise<any> = operation.execute();

              // Assert
              return expect(result).to.eventually.fulfilled;
            });

            it('should update the user password', () => {
              // Act
              var result: Promise<any> = operation.execute();

              // Assert
              return expect(result).to.eventually.fulfilled
                .then(() => UserDataHandler.getUser(user.id))
                .then((_user: User) => {
                  expect(passwordHash.verify(newPassword, _user.attributes.password_hash)).to.be.true;
                });
            });

          });

          describe('on empty new password', () => {

            var operation: UpdateUserPasswordOperation;

            beforeEach(() => {
              operation = new UpdateUserPasswordOperation(
                user.id,
                userPassword,
                '',
                executingUser.id);
            });

            it('should fail execution', () => {
              // Act
              var result: Promise<any> = operation.execute();

              // Assert
              return expect(result).to.eventually.rejected
                .then((error) => {
                  expect(error).to.be.equal('The new password cannot be empty');
                });
            });

            it('should not update the user', () => {
              // Act
              var result: Promise<any> = operation.execute();

              // Assert
              return expect(result).to.eventually.rejected
                .then(() => UserDataHandler.getUser(user.id))
                .then((_user: User) => {
                  ModelInfoVerificator.verifyInfo(_user.attributes, user.attributes);
                });
            });

          });

        });

      });

    });

  });

  describe('canChangePassword', () => {

    describe('executing user is same as the password change user', () => {

      it('null new password, verifyNewPassword = true, should reject', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          null,
          user.id);

        return expect(operation.canChangePassword(true)).to.be.rejected;
      });

      it('not null new password, verifyNewPassword = true, should resolve', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          'new password',
          user.id);

        return expect(operation.canChangePassword(true)).to.be.fulfilled;
      });

      it('null new password, verifyNewPassword = false, should resolve', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          null,
          user.id);

        return expect(operation.canChangePassword(false)).to.be.fulfilled;
      });

      it('not null new password, verifyNewPassword = false, should resolve', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          'new password',
          user.id);

        return expect(operation.canChangePassword(false)).to.be.fulfilled;
      });

    });

    describe('executing user is not the same as the password change user', () => {

      it('null new password, verifyNewPassword = true, should reject', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          null,
          otherUser.id);

        return expect(operation.canChangePassword(true)).to.be.rejected;
      });

      it('not null new password, verifyNewPassword = true, should reject', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          'new password',
          otherUser.id);

        return expect(operation.canChangePassword(true)).to.be.rejected;
      });

      it('null new password, verifyNewPassword = false, should reject', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          null,
          otherUser.id);

        return expect(operation.canChangePassword(false)).to.be.rejected;
      });

      it('not null new password, verifyNewPassword = false, should reject', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          'new password',
          otherUser.id);

        return expect(operation.canChangePassword(false)).to.be.rejected;
      });

    });

    describe('executing user is not the same as the password change user but admin', () => {

      beforeEach(() => {
        return UserDataHandler.addGlobalPermissions(otherUser.id, [GlobalPermission.ADMIN]);
      })

      it('null new password, verifyNewPassword = true, should reject', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          null,
          otherUser.id);

        return expect(operation.canChangePassword(true)).to.be.rejected;
      });

      it('not null new password, verifyNewPassword = true, should resolve', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          'new password',
          otherUser.id);

        return expect(operation.canChangePassword(true)).to.be.fulfilled;
      });

      it('null new password, verifyNewPassword = false, should resolve', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          null,
          otherUser.id);

        return expect(operation.canChangePassword(false)).to.be.fulfilled;
      });

      it('not null new password, verifyNewPassword = false, should resolve', () => {
        var operation = new UpdateUserPasswordOperation(user.id,
          userPassword,
          'new password',
          otherUser.id);

        return expect(operation.canChangePassword(false)).to.be.fulfilled;
      });

    });

  });

});
