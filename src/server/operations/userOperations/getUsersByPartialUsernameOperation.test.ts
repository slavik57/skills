import {GetUsersByPartialUsernameOperation} from "./getUsersByPartialUsernameOperation";
import {ModelVerificator} from "../../testUtils/modelVerificator";
import {User} from "../../models/user";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetUsersByPartialUsernameOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    var users: User[];
    var usernameSuffix: string;

    beforeEach(() => {
      usernameSuffix = '_GetUsersByPartialUsernameOperation';

      var createUserPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(4, usernameSuffix)
          .then((_users: User[]) => {
            users = _users;
          });

      return createUserPromise;
    });

    it('getting by "2" should return correct user', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation('2');

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, [users[2]]);
        });
    });

    it('getting by "3" should return correct user', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation('3');

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, [users[3]]);
        });
    });

    it('getting by usernameSuffix should return correct users', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation(usernameSuffix);

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
        });
    });

    it('getting by usernameSuffix with null max users should return correct users', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation(usernameSuffix, null);

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
        });
    });

    it('getting by usernameSuffix with undefined max users should return correct users', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation(usernameSuffix, undefined);

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
        });
    });

    it('getting by usernameSuffix with limited number of users to 0 should return no users', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation(usernameSuffix, 0);

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          expect(_actualUsers).to.be.length(0);
        });
    });
    it('getting by usernameSuffix with limited number of users should return correct users', () => {
      // Arrange
      var maxNumberOfUsers = 1;

      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation(usernameSuffix, maxNumberOfUsers);

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          expect(_actualUsers).to.be.length(maxNumberOfUsers);

          _actualUsers.forEach((_user) => {
            expect(_user.attributes.username).to.contain(usernameSuffix);
          });
        });
    });

  });

});
