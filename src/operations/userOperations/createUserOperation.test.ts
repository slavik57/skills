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

    });

  })

});
