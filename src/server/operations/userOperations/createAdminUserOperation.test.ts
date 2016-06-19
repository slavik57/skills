import {GlobalPermission} from "../../models/enums/globalPermission";
import {CreateAdminUserOperation} from "./createAdminUserOperation";
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

describe('CreateAdminUserOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var operation: CreateAdminUserOperation;
    var expectedUsername: string;
    var expectedPassword: string;
    var expectedEmail: string;
    var expectedFirstName: string;
    var expectedLastName: string;


    beforeEach(() => {
      expectedUsername = 'admin';
      expectedPassword = 'admin';
      expectedEmail = null;
      expectedFirstName = 'admin';
      expectedLastName = 'admin';

      operation = new CreateAdminUserOperation();
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

          expect(user.attributes.username).to.be.equal(expectedUsername);
          expect(user.attributes.email).to.be.equal(expectedEmail);
          expect(user.attributes.firstName).to.be.equal(expectedFirstName);
          expect(user.attributes.lastName).to.be.equal(expectedLastName);
        });
    });

    it('should add ADMIN global permissions to the user', () => {
      // Act
      var result: Promise<any> = operation.execute();

      // Assert
      return expect(result).to.eventually.fulfilled
        .then(() => UserDataHandler.getUsers())
        .then((_users: User[]) => _users[0])
        .then((_user: User) => UserDataHandler.getUserGlobalPermissions(_user.id))
        .then((_permissions: GlobalPermission[]) => {
          expect(_permissions).to.be.deep.equal([GlobalPermission.ADMIN]);
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
          expect(passwordHash.verify(expectedPassword, actualHashedPassword), 'the password should be hashed correctly').to.be.true;
        });
    });

    it('should return the new user', () => {
      // Act
      var result: Promise<User> = operation.execute();

      // Assert
      return expect(result).to.eventually.fulfilled
        .then((_user: User) => {
          expect(_user.attributes.username).to.be.equal(expectedUsername);
          expect(_user.attributes.email).to.be.equal(expectedEmail);
          expect(_user.attributes.firstName).to.be.equal(expectedFirstName);
          expect(_user.attributes.lastName).to.be.equal(expectedLastName);
        });
    });

  });

});
