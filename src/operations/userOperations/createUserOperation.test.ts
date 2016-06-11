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

chai.use(chaiAsPromised);

describe('CreateUserOperation', () => {

  beforeEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('new', () => {

    it('should initialize correctly', () => {
      // Arrange
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);

      // Act
      var operation = new CreateUserOperation(userInfo);

      // Assert
      expect(operation.userInfo).to.be.equal(userInfo);
    });

  });

  describe('execute', () => {

    describe('on invalid user info', () => {

      var operation: CreateUserOperation;

      beforeEach(() => {
        var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(1);
        delete userInfo.username;

        operation = new CreateUserOperation(userInfo);
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

      beforeEach(() => {
        userInfo = ModelInfoMockFactory.createUserInfo(1);

        operation = new CreateUserOperation(userInfo);
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

            ModelInfoVerificator.verifyInfo(_users[0].attributes, userInfo);
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

    });

  })

});
