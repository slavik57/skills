import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { IUser, User, Users } from './user';
import { TestUtils } from '../testUtils/modelsUtils/user';

chai.use(chaiAsPromised);

describe('User', () => {
  describe('new', () => {
    var validUserInfo: IUser;

    beforeEach((done: Function) => {
      TestUtils.clearUsersTable(done);

      validUserInfo = {
        username: 'slavik57',
        password_hash: 'some hash',
        email: 's@gmail.com',
        firstName: 'Slava',
        lastName: 'Shp',
      };
    });

    afterEach((done: Function) => {
      TestUtils.clearUsersTable(done);
    });

    it('create user with empty fields - should return error', () => {
      // Arrange
      var user = new User();

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.be.rejected;
    });

    it('create user with missing username - should return error', () => {
      // Arrange
      delete validUserInfo.username;
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing password_hash - should return error', () => {
      // Arrange
      delete validUserInfo.password_hash;
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing email - should return error', () => {
      // Arrange
      delete validUserInfo.email;
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing firstName - should return error', () => {
      // Arrange
      delete validUserInfo.firstName;
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with missing lastName should return error', () => {
      // Arrange
      delete validUserInfo.lastName;

      var user = new User(validUserInfo);
      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    // TODO: fix tests and add more tests for unique constraints

    it('create user with invalid email should return error', () => {
      // Arrange
      validUserInfo.email = 'ssssss';
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with empty email should return error', () => {
      // Arrange
      validUserInfo.email = '';
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create user with everything ok should save user correctly', () => {
      // Arrange
      var user = new User(validUserInfo);

      // Act
      var promise: Promise<User> = user.save();

      // Assert
      return expect(promise).to.eventually.equal(user);
    });

  });
});
