import {IUserRegistrationDefinition} from "./interfaces/iUserRegistrationDefinition";
import {UserLoginManager} from "../testUtils/userLoginManager";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ExpressServer} from "../expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as supertest from 'supertest';
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from '../enums/statusCode';
import {webpackInitializationTimeout} from '../../../testConfigurations';

chai.use(chaiAsPromised);

const timeoutForLoadingServer = 100000;

describe('LoginStrategy', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserRegistrationDefinition;

  before(function(done) {
    this.timeout(webpackInitializationTimeout);

    ExpressServer.instance.initialize()
      .then((_expressServer) => {
        expressServer = _expressServer;

        server = supertest.agent(expressServer.expressApp);

        done();
      });
  });

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);
    return EnvironmentCleaner.clearTables();
  });

  beforeEach(function() {
    this.timeout(webpackInitializationTimeout);

    userDefinition = {
      username: 'someUser',
      password: 'somePassword',
      email: 'a@gmail.com',
      firstName: 'first name',
      lastName: 'last name'
    }

    return UserLoginManager.logoutUser(server);
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('login', () => {

    beforeEach(() => {
      return UserLoginManager.registerUser(server, userDefinition);
    });

    it('existing user should secceed and redirect', (done) => {
      server.post('/login')
        .send({ username: userDefinition.username, password: userDefinition.password })
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

    it('not existing user should fail', (done) => {
      server.post('/login')
        .send({ username: 'not existing username', password: 'some password' })
        .expect(StatusCode.UNAUTHORIZED).
        end(done);
    });

  });

});
