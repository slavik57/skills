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



    beforeEach(() => {
      var createUserPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(4)
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

    it('getting by "username" should return correct user', () => {
      // Arrange
      var operation: GetUsersByPartialUsernameOperation =
        new GetUsersByPartialUsernameOperation('username');

      // Act
      var resultPromise: Promise<User[]> = operation.execute();

      // Assert
      return expect(resultPromise).to.eventually.fulfilled
        .then((_actualUsers: User[]) => {
          ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
        });
    });

  });

});
