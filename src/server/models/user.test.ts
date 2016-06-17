import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {IUserInfo} from "./interfaces/iUserInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { User, Users } from './user';

chai.use(chaiAsPromised);

describe('User', () => {
  describe('new', () => {
    var validUserInfo1: IUserInfo;
    var validUserInfo2: IUserInfo;

    beforeEach(() => {
      validUserInfo1 = {
        username: 'slavik57',
        password_hash: 'some hash',
        email: 's@gmail.com',
        firstName: 'Slava',
        lastName: 'Shp',
      };

      validUserInfo2 = {
        username: 'slavik57_2',
        password_hash: 'some hash 2',
        email: 's2@gmail.com',
        firstName: 'Slava2',
        lastName: 'Shp2',
      };

      return EnvironmentCleaner.clearTables();
    });

    afterEach(() => {
      EnvironmentCleaner.clearTables();
    });

    it('create user with empty fields - should return error', () => {
      // Arrange
      var user = new User();

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing username - should return error', () => {
      // Arrange
      delete validUserInfo1.username;
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing password_hash - should return error', () => {
      // Arrange
      delete validUserInfo1.password_hash;
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing email - should succeed', () => {
      // Arrange
      delete validUserInfo1.email;
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.fulfilled;
    });

    it('create user with missing email should be fetched', () => {
      // Arrange
      delete validUserInfo1.email;
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      var usersPromise =
        promise.then(() => new Users().fetch());

      return expect(usersPromise).to.eventually.fulfilled
        .then((users: Collection<User>) => {
          expect(users.size()).to.be.equal(1);
        });
    });

    it('create user with missing firstName - should return error', () => {
      // Arrange
      delete validUserInfo1.firstName;
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing lastName should return error', () => {
      // Arrange
      delete validUserInfo1.lastName;

      var user = new User(validUserInfo1);
      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with existing username should return error', () => {
      // Arrange
      var user1 = new User(validUserInfo1);

      validUserInfo2.username = validUserInfo1.username;
      var user2 = new User(validUserInfo2);

      // Act
      var promise: Promise<User> =
        user1.save().then(
          () => user2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with existing email should return error', () => {
      // Arrange
      var user1 = new User(validUserInfo1);

      validUserInfo2.email = validUserInfo1.email;
      var user2 = new User(validUserInfo2);

      // Act
      var promise: Promise<User> =
        user1.save().then(
          () => user2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with existing firstName and lastName should return error', () => {
      // Arrange
      var user1 = new User(validUserInfo1);

      validUserInfo2.firstName = validUserInfo1.firstName;
      validUserInfo2.lastName = validUserInfo1.lastName;
      var user2 = new User(validUserInfo2);

      // Act
      var promise: Promise<User> =
        user1.save().then(
          () => user2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with existing firstName but different lastName should succeed', () => {
      // Arrange
      var user1 = new User(validUserInfo1);

      validUserInfo2.firstName = validUserInfo1.firstName;
      var user2 = new User(validUserInfo2);

      // Act
      var promise: Promise<User> =
        user1.save().then(
          () => user2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.equal(user2);
    });

    it('create user with existing lastName but different firstName should succeed', () => {
      // Arrange
      var user1 = new User(validUserInfo1);

      validUserInfo2.lastName = validUserInfo1.lastName;
      var user2 = new User(validUserInfo2);

      // Act
      var promise: Promise<User> =
        user1.save().then(
          () => user2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.equal(user2);
    });

    it('create user with empty username should return error', () => {
      // Arrange
      validUserInfo1.username = '';
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with empty password_hash should return error', () => {
      // Arrange
      validUserInfo1.password_hash = '';
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with empty email should return error', () => {
      // Arrange
      validUserInfo1.email = '';
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with empty firstName should return error', () => {
      // Arrange
      validUserInfo1.firstName = '';
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with empty lastName should return error', () => {
      // Arrange
      validUserInfo1.lastName = '';
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with everything ok should save user correctly', () => {
      // Arrange
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.equal(user);
    });

    it('create user with invalid email should return error', () => {
      // Arrange
      validUserInfo1.email = 'ssssss';
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with everything ok should be fetched', () => {
      // Arrange
      var user = new User(validUserInfo1);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      var usersPromise =
        promise.then(() => new Users().fetch());

      return expect(usersPromise).to.eventually.fulfilled
        .then((users: Collection<User>) => {
          expect(users.size()).to.be.equal(1);
        });
    });

  });
});

describe('Users', () => {
  describe('clearAll', () => {

    it('should clear all the users', () => {
      // Act
      var promise: Promise<void> = Users.clearAll();

      // Assert
      var usersPromise =
        promise.then(() => new Users().fetch());

      return expect(usersPromise).to.eventually.fulfilled
        .then((users: Collection<User>) => {
          expect(users.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        Users.clearAll().then(() => Users.clearAll());

      // Assert
      var usersPromise =
        promise.then(() => new Users().fetch());

      return expect(usersPromise).to.eventually.fulfilled;
    });

  });
});
