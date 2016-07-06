import {GlobalPermission} from "../../models/enums/globalPermission";
import {CreateUserOperation} from "./createUserOperation";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as passwordHash from 'password-hash';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

describe('CreateUserOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('on invalid user info', () => {

      var operation: CreateUserOperation;

      beforeEach(() => {
        var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
        delete userInfo.username;

        operation = new CreateUserOperation(userInfo.username,
          userInfo.password_hash,
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

      it('should not create a user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.rejected
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(0);
          });
      });

    });

    describe('on valid user info', () => {

      var operation: CreateUserOperation;
      var userInfo: IUserInfo;
      var password: string;

      beforeEach(() => {
        userInfo = ModelInfoMockFactory.createUserInfo(1);

        password = 'some random passowrd';

        operation = new CreateUserOperation(userInfo.username,
          password,
          userInfo.email,
          userInfo.firstName,
          userInfo.lastName);
      });

      it('should succeed execution', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled;
      });

      it('should create a correct user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(1);

            var user: User = _users[0];

            expect(user.attributes.username).to.be.equal(userInfo.username);
            expect(user.attributes.email).to.be.equal(userInfo.email);
            expect(user.attributes.firstName).to.be.equal(userInfo.firstName);
            expect(user.attributes.lastName).to.be.equal(userInfo.lastName);
          });
      });

      it('without an email should create a correct user', () => {
        // Arrange
        operation = new CreateUserOperation(userInfo.username,
          password,
          null,
          userInfo.firstName,
          userInfo.lastName);

        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(1);

            var user: User = _users[0];

            expect(user.attributes.username).to.be.equal(userInfo.username);
            expect(user.attributes.email).to.be.null;
            expect(user.attributes.firstName).to.be.equal(userInfo.firstName);
            expect(user.attributes.lastName).to.be.equal(userInfo.lastName);
          });
      });

      it('should add READER global permissions to the user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => _users[0])
          .then((_user: User) => UserDataHandler.getUserGlobalPermissions(_user.id))
          .then((_permissions: GlobalPermission[]) => {
            expect(_permissions).to.be.deep.equal([GlobalPermission.READER]);
          })
      });

      it('should hash the password correctly', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(1);

            var user: User = _users[0];
            var actualHashedPassword = user.attributes.password_hash;

            expect(passwordHash.isHashed(actualHashedPassword), 'should hash the password').to.be.true;
            expect(passwordHash.verify(password, actualHashedPassword), 'the password should be hashed correctly').to.be.true;
          });
      });

      it('should return the new user', () => {
        // Act
        var result: Promise<User> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then((_user: User) => {
            expect(_user.attributes.username).to.be.equal(userInfo.username);
            expect(_user.attributes.email).to.be.equal(userInfo.email);
            expect(_user.attributes.firstName).to.be.equal(userInfo.firstName);
            expect(_user.attributes.lastName).to.be.equal(userInfo.lastName);
          });
      });

      it('with existing username should fail', () => {
        // Arrange
        var createUserOperation = new CreateUserOperation(userInfo.username,
          password + 1,
          'a' + userInfo.email,
          userInfo.firstName + 1,
          userInfo.lastName + 1);

        // Act
        var result: Promise<any> = createUserOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.rejected
          .then((error: any) => {
            expect(error).to.be.equal('The username is taken');
          });
      });

      it('with existing email should fail', () => {
        // Arrange
        var createUserOperation = new CreateUserOperation(userInfo.username + 1,
          password + 1,
          userInfo.email,
          userInfo.firstName + 1,
          userInfo.lastName + 1);

        // Act
        var result: Promise<any> = createUserOperation.execute()
          .then(() => operation.execute());

        // Assert
        return expect(result).to.eventually.rejected
          .then((error: any) => {
            expect(error).to.be.equal('The email is taken');
          });
      });

      it('creating 2 users with same passwords should hash each password differently', () => {
        // Arrange
        var user1Operation = new CreateUserOperation(userInfo.username + 1,
          password,
          '1' + userInfo.email,
          userInfo.firstName + 1,
          userInfo.lastName + 1);

        var user2Operation = new CreateUserOperation(userInfo.username + 2,
          password,
          '2' + userInfo.email,
          userInfo.firstName + 2,
          userInfo.lastName + 2);

        // Act
        var result: bluebirdPromise<User[]> = bluebirdPromise.all([
          user1Operation.execute(),
          user2Operation.execute()
        ]);

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(2);

            var user1: User = _users[0];
            var user2: User = _users[1];
            var actualHashedPassword1 = user1.attributes.password_hash;
            var actualHashedPassword2 = user2.attributes.password_hash;

            expect(passwordHash.isHashed(actualHashedPassword1), 'should hash the first password').to.be.true;
            expect(passwordHash.isHashed(actualHashedPassword2), 'should hash the second password').to.be.true;
            expect(passwordHash.verify(password, actualHashedPassword1), 'the first password should be hashed correctly').to.be.true;
            expect(passwordHash.verify(password, actualHashedPassword2), 'the second password should be hashed correctly').to.be.true;

            expect(actualHashedPassword1).to.not.be.equal(actualHashedPassword2);
          });
      });

    });

    describe('without email', () => {

      var operation: CreateUserOperation;
      var userInfo: IUserInfo;

      beforeEach(() => {
        userInfo = ModelInfoMockFactory.createUserInfo(1);
        delete userInfo.email;

        operation = new CreateUserOperation(userInfo.username,
          userInfo.password_hash,
          userInfo.email,
          userInfo.firstName,
          userInfo.lastName);
      });

      it('should create a correct user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(1);

            var user: User = _users[0];

            expect(user.attributes.username).to.be.equal(userInfo.username);
            expect(user.attributes.email).to.be.null;
            expect(user.attributes.firstName).to.be.equal(userInfo.firstName);
            expect(user.attributes.lastName).to.be.equal(userInfo.lastName);
          });
      });

    });

    describe('with empty email', () => {

      var operation: CreateUserOperation;
      var userInfo: IUserInfo;

      beforeEach(() => {
        userInfo = ModelInfoMockFactory.createUserInfo(1);
        userInfo.email = '';

        operation = new CreateUserOperation(userInfo.username,
          userInfo.password_hash,
          userInfo.email,
          userInfo.firstName,
          userInfo.lastName);
      });

      it('should create a correct user', () => {
        // Act
        var result: Promise<any> = operation.execute();

        // Assert
        return expect(result).to.eventually.fulfilled
          .then(() => UserDataHandler.getUsers())
          .then((_users: User[]) => {
            expect(_users).to.be.length(1);

            var user: User = _users[0];

            expect(user.attributes.username).to.be.equal(userInfo.username);
            expect(user.attributes.email).to.be.null;
            expect(user.attributes.firstName).to.be.equal(userInfo.firstName);
            expect(user.attributes.lastName).to.be.equal(userInfo.lastName);
          });
      });

    });

  })

});
