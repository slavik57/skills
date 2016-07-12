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
        UserDataHandler.createUser(otherUserInfo)
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
        operation = new UpdateUserPasswordOperation(
          user.id + otherUser.id + 9999,
          userPassword,
          'new password');
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
          'new password');
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
          '');
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

      var operation: UpdateUserPasswordOperation;
      var newPassword: string;

      beforeEach(() => {
        newPassword = 'some new password for the user';

        operation = new UpdateUserPasswordOperation(
          user.id,
          userPassword,
          newPassword);
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

  })

});
