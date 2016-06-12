import {CreateUserOperation} from "./createUserOperation";
import {LoginUserOperation} from "./loginUserOperation";
import {IUserInfo} from "../../models/interfaces/iUserInfo";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as passwordHash from 'password-hash';

chai.use(chaiAsPromised);

describe('LoginUserOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var username: string;
    var password: string;
    var user: User;

    beforeEach(() => {
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);

      username = userInfo.username;
      password = 'some random password';

      var createUserOperation =
        new CreateUserOperation(username,
          password,
          userInfo.email,
          userInfo.firstName,
          userInfo.lastName);

      return createUserOperation.execute()
        .then((_user: User) => {
          user = _user;
        })
    });

    it('not existing username should reject', () => {
      // Arrange
      var operation = new LoginUserOperation('not existing username', password);

      // Act
      var resultPromise: Promise<any> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.rejected;
    });

    it('invalid password should reject', () => {
      // Arrange
      var operation = new LoginUserOperation(username, 'invalid password');

      // Act
      var resultPromise: Promise<any> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.rejected;
    });

    it('valid credentials should succeed', () => {
      // Arrange
      var operation = new LoginUserOperation(username, password);

      // Act
      var resultPromise: Promise<any> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled;
    });

    it('valid credentials should return the user', () => {
      // Arrange
      var operation = new LoginUserOperation(username, password);

      // Act
      var resultPromise: Promise<any> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_user: User) => {
          expect(_user.id).to.be.equal(user.id);
        });
    });

  });

});
