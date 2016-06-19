import {UserDataHandler} from "./dataHandlers/userDataHandler";
import {LoginUserOperation} from "./operations/userOperations/loginUserOperation";
import {IUserInfo} from "./models/interfaces/iUserInfo";
import {GlobalPermission} from "./models/enums/globalPermission";
import {IUserRegistrationDefinition} from "./passportStrategies/interfaces/iUserRegistrationDefinition";
import {CreateUserOperation} from "./operations/userOperations/createUserOperation";
import {User} from "./models/user";
import {EnvironmentCleaner} from "./testUtils/environmentCleaner";
import {ExpressServer} from "./expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as supertest from 'supertest';
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {webpackInitializationTimeout} from '../../testConfigurations';

chai.use(chaiAsPromised);

describe('ExpressServer', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;
  var adminUsername: string;
  var adminDefaultPassword: string;

  before(function(done) {
    this.timeout(webpackInitializationTimeout);

    return ExpressServer.instance.initialize()
      .then((_expressServer) => {
        expressServer = _expressServer;

        server = supertest.agent(expressServer.expressApp);

        done();
      });
  });

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);

    adminUsername = 'admin';
    adminDefaultPassword = 'admin';

    return EnvironmentCleaner.clearTables();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  function verifyAdminUserInfo(userInfo: IUserInfo, expectedUserInfo: IUserRegistrationDefinition): void {
    expect(userInfo.username).to.be.equal(expectedUserInfo.username);
    expect(userInfo.email).to.be.equal(expectedUserInfo.email);
    expect(userInfo.firstName).to.be.equal(expectedUserInfo.firstName);
    expect(userInfo.lastName).to.be.equal(expectedUserInfo.lastName);
  }

  function verifyAdminRights(user: User): Promise<any> {
    var expectedPermissions = [
      GlobalPermission.ADMIN
    ];

    return expect(UserDataHandler.getUserGlobalPermissions(user.id)).to.eventually.fulfilled
      .then((_permissions: GlobalPermission[]) => {
        expect(_permissions).to.be.deep.equal(expectedPermissions);
      });
  }

  describe('initialize', () => {

    describe('admin user does not exist', () => {

      var defaultAdminInfo: IUserRegistrationDefinition;

      beforeEach(() => {
        defaultAdminInfo = {
          username: adminUsername,
          password: adminDefaultPassword,
          email: null,
          firstName: adminUsername,
          lastName: adminUsername
        };
      });

      it('should create the admin user with correct info', () => {
        // Act
        var initializationPromise: Promise<ExpressServer> =
          expressServer.initialize();

        // Assert
        return expect(initializationPromise).to.eventually.fulfilled
          .then(() => new LoginUserOperation(adminUsername, adminDefaultPassword).execute())
          .then((_user: User) => {
            verifyAdminUserInfo(_user.attributes, defaultAdminInfo);
          });
      });

      it('should create the admin user with correct user rights', () => {
        // Act
        var initializationPromise: Promise<ExpressServer> =
          expressServer.initialize();

        // Assert
        return expect(initializationPromise).to.eventually.fulfilled
          .then(() => new LoginUserOperation(adminUsername, adminDefaultPassword).execute())
          .then((_user: User) => {
            return verifyAdminRights(_user);
          });
      });

    });

    describe('admin user exists', () => {

      var adminRegistrationDefinition: IUserRegistrationDefinition;

      beforeEach(() => {
        adminRegistrationDefinition = {
          username: adminUsername,
          password: adminDefaultPassword + 'not default password',
          email: 'email@gmail.com',
          firstName: 'first name',
          lastName: 'last name'
        }

        var createUserOperation =
          new CreateUserOperation(adminRegistrationDefinition.username,
            adminRegistrationDefinition.password,
            adminRegistrationDefinition.email,
            adminRegistrationDefinition.firstName,
            adminRegistrationDefinition.lastName);

        return createUserOperation.execute();
      });

      it('should not change the admin information', () => {
        // Act
        var initializationPromise: Promise<ExpressServer> =
          expressServer.initialize();

        // Assert
        return expect(initializationPromise).to.eventually.fulfilled
          .then(() => new LoginUserOperation(adminUsername, adminRegistrationDefinition.password).execute())
          .then((_user: User) => {
            verifyAdminUserInfo(_user.attributes, adminRegistrationDefinition);
          });
      });

    });

  });

});
