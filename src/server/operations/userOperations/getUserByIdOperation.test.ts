import {ModelInfoVerificator} from "../../testUtils/modelInfoVerificator";
import {User} from "../../models/user";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetUserByIdOperation} from './getUserByIdOperation';
import * as _ from 'lodash';

chai.use(chaiAsPromised);

describe('GetUserByIdOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('execute', () => {

    describe('existing user', () => {

      var user: User;
      var operation: GetUserByIdOperation;

      beforeEach(() => {
        var createUserPromise: Promise<any> =
          EnvironmentDirtifier.createUsers(1)
            .then((_users: User[]) => {
              [user] = _users;
            });

        return createUserPromise.then(() => {
          operation = new GetUserByIdOperation(user.id);
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

      var operation: GetUserByIdOperation;

      beforeEach(() => {
        operation = new GetUserByIdOperation(11122233);
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
