import {UpdateUserDetailsOperation} from "./updateUserDetailsOperation";
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

chai.use(chaiAsPromised);

describe('UpdateUserDetailsOperation', () => {

  var user: User;
  var otherUser: User;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => EnvironmentDirtifier.createUsers(2))
      .then((_users: User[]) => {
        [user, otherUser] = _users;
      })
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('on invalid user info', () => {

      var operation: UpdateUserDetailsOperation;

      beforeEach(() => {
        var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
        delete userInfo.username;

        operation = new UpdateUserDetailsOperation(
          user.id,
          userInfo.username,
          userInfo.email,
          userInfo.firstName,
          userInfo.lastName);
      });

      it('should fail execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected;
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

      var operation: UpdateUserDetailsOperation;
      var newUserInfo: IUserInfo;

      beforeEach(() => {
        newUserInfo = {
          username: user.attributes.username + ' new username',
          password_hash: user.attributes.password_hash,
          email: 'newMail' + user.attributes.email,
          firstName: user.attributes.firstName + ' new first name',
          lastName: user.attributes.lastName + ' new last name'
        }

        operation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          newUserInfo.firstName,
          newUserInfo.lastName);
      });

      it('should succeed execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('should update the user details', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            expect(_user.attributes.username).to.be.equal(newUserInfo.username);
            expect(_user.attributes.email).to.be.equal(newUserInfo.email);
            expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
            expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
          });
      });

      it('without an email should update the user details', () => {
        // Arrange
        operation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          null,
          newUserInfo.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            expect(_user.attributes.username).to.be.equal(newUserInfo.username);
            expect(_user.attributes.email).to.be.null;
            expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
            expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
          });
      });

      it('should not change the password', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            expect(_user.attributes.password_hash).to.be.equal(user.attributes.password_hash);
          });
      });

      it('should return the user', () => {
        // Act
        var result: Promise<User> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then((_user: User) => {
            expect(_user.attributes.username).to.be.equal(newUserInfo.username);
            expect(_user.attributes.email).to.be.equal(newUserInfo.email);
            expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
            expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
          });
      });

      it('with same username should succeed', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          user.attributes.username,
          newUserInfo.email,
          newUserInfo.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('with same email should succeed', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          user.attributes.email,
          newUserInfo.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('with same firstName should succeed', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          user.attributes.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('with same lastName should succeed', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          newUserInfo.firstName,
          user.attributes.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('with existing username should fail', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          otherUser.attributes.username,
          newUserInfo.email,
          newUserInfo.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.rejected
          .then((error: any) => {
            expect(error).to.be.equal('The username is taken');
          });
      });

      it('with existing email should fail', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          otherUser.attributes.email,
          newUserInfo.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.rejected
          .then((error: any) => {
            expect(error).to.be.equal('The email is taken');
          });
      });

      it('with existing firstName should succeed', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          otherUser.attributes.firstName,
          newUserInfo.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('with existing lastName should succeed', () => {
        // Arrange
        var updateUserDetailsOperation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          newUserInfo.firstName,
          otherUser.attributes.lastName);

        // Act
        var result: Promise<any> = updateUserDetailsOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

    });

    describe('without email', () => {

      var operation: UpdateUserDetailsOperation;
      var newUserInfo: IUserInfo;

      beforeEach(() => {
        newUserInfo = {
          username: user.attributes.username + ' new username',
          password_hash: user.attributes.password_hash,
          email: 'newMail' + user.attributes.email,
          firstName: user.attributes.firstName + ' new first name',
          lastName: user.attributes.lastName + ' new last name'
        }
        delete newUserInfo.email;

        operation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          newUserInfo.firstName,
          newUserInfo.lastName);
      });

      it('should update the user details correctly', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            expect(_user.attributes.username).to.be.equal(newUserInfo.username);
            expect(_user.attributes.email).to.be.null;
            expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
            expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
          });
      });

    });

    describe('with empty email', () => {

      var operation: UpdateUserDetailsOperation;
      var newUserInfo: IUserInfo;

      beforeEach(() => {
        newUserInfo = {
          username: user.attributes.username + ' new username',
          password_hash: user.attributes.password_hash,
          email: 'newMail' + user.attributes.email,
          firstName: user.attributes.firstName + ' new first name',
          lastName: user.attributes.lastName + ' new last name'
        }
        newUserInfo.email = '';

        operation = new UpdateUserDetailsOperation(
          user.id,
          newUserInfo.username,
          newUserInfo.email,
          newUserInfo.firstName,
          newUserInfo.lastName);
      });

      it('should update the user details correctly', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUser(user.id))
          .then((_user: User) => {
            expect(_user.attributes.username).to.be.equal(newUserInfo.username);
            expect(_user.attributes.email).to.be.null;
            expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
            expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
          });
      });

    });

  })

});
