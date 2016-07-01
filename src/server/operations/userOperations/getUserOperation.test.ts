import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {User} from "../../models/user";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetUserOperation} from './getUserOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetUsersOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('existing user', () => {

      var user: User;
      var operation: GetUserOperation;

      beforeEach(() => {
        var createUserPromise: Promise<any> =
          EnvironmentDirtifier.createUsers(1)
            .then((_users: User[]) => {
              [user] = _users;
            });

        return createUserPromise.then(() => {
          operation = new GetUserOperation(user.attributes.username);
        })
      });

      it('should return correct user', () => {
        // Act
        var resultPromise: Promise<User> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then((_actualUser: User) => {
            ModelInfoVerificator.verifyInfo(_actualUser.attributes, user.attributes);
          });
      });

    });

    describe('not existing user', () => {

      var operation: GetUserOperation;

      beforeEach(() => {
        operation = new GetUserOperation('not existing user');
      });

      it('should return null', () => {
        // Act
        var resultPromise: Promise<User> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then((_actualUser: User) => {
            expect(_actualUser).to.be.null;
          });
      });

    });

  });

});
