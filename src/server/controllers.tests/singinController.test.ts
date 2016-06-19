import {UserLoginManager} from "../testUtils/userLoginManager";
import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {PageTextResolver} from "../testUtils/pageTextResolver";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {PathHelper} from "../../common/pathHelper";
import {ExpressServer} from "../expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as supertest from 'supertest';
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from '../enums/statusCode';
import {webpackInitializationTimeout} from '../../../testConfigurations';

chai.use(chaiAsPromised);

describe('SigninController', () => {

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

  describe('user not logged in', () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    })

    it('signin should return correct html', (done) => {
      server.get('/signin')
        .expect(StatusCode.OK)
        .expect(PageTextResolver.getSigninPage(expressServer))
        .end(done);
    });

  });

  describe('user registered', () => {

    it('signin should redirect to home', (done) => {
      server.post('/register')
        .send(userDefinition)
        .end(() => {
          server.get('/signin')
            .expect(StatusCode.REDIRECT)
            .expect('Location', '/')
            .end(done);
        });
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('signin should return correct html', (done) => {
        server.get('/signin')
          .expect(StatusCode.OK)
          .expect(PageTextResolver.getSigninPage(expressServer))
          .end(done);
      });

    });

  });

  describe('user logged in', () => {

    beforeEach(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserLoginManager.loginUser(server, userDefinition));
    });

    it('singin should redirect to home', (done) => {
      server.get('/signin')
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('signin should return correct html', (done) => {
        server.get('/signin')
          .expect(StatusCode.OK)
          .expect(PageTextResolver.getSigninPage(expressServer))
          .end(done);
      });

    });

  });

});
