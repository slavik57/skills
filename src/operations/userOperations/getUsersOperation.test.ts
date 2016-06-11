import {ModelVerificator} from "../../testUtils/modelVerificator";
import {User} from "../../models/user";
import {EnvironmentDirtifier} from "../../testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised'
import {GetUsersOperation} from './getUsersOperation';
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

    var users: User[];

    var operation: GetUsersOperation;

    beforeEach(() => {
      var createUserPromise: Promise<any> =
        EnvironmentDirtifier.createUsers(1)
          .then((_users: User[]) => {
            users = _users;
          });

      return createUserPromise.then(() => {
        operation = new GetUsersOperation();
      })
    });

    it('should return correct users', () => {
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
