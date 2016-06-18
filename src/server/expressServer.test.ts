import {UserLoginManager} from "./testUtils/userLoginManager";
import {UserDataHandler} from "./dataHandlers/userDataHandler";
import {User} from "./models/user";
import {EnvironmentCleaner} from "./testUtils/environmentCleaner";
// import {PathHelper} from "../common/pathHelper";
import {ExpressServer} from "./expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as request from 'supertest';
// import {Response} from 'supertest';
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from './enums/statusCode';

chai.use(chaiAsPromised);

const timeoutForLoadingServer = 100000;

interface IUserDefinition {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

describe('ExpressServer', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserDefinition;

  before(function() {
    this.timeout(timeoutForLoadingServer);

    expressServer = ExpressServer.instance.initialize();

    server = request.agent(expressServer.expressApp);
  });

  beforeEach(function() {
    this.timeout(timeoutForLoadingServer);
    return EnvironmentCleaner.clearTables();
  });

  beforeEach(function() {
    this.timeout(timeoutForLoadingServer);

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

  describe('register', () => {

    it('invalid parameters should fail', (done) => {
      userDefinition.email = 'wrong email';

      server.post('/register')
        .send(userDefinition)
        .expect(StatusCode.BAD_REQUEST)
        .end(done);
    });

    it('should redirect to home page', (done) => {
      server.post('/register')
        .send(userDefinition)
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

    it('should create a user', (done) => {
      server.post('/register')
        .send(userDefinition)
        .end(() => {

          UserDataHandler.getUserByUsername(userDefinition.username)
            .then((_user: User) => {
              expect(_user.attributes.username).to.be.equal(userDefinition.username);
              done();
            }, () => {
              expect(true, 'should create a user').to.be.false;
              done();
            })

        });
    });

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

  describe('user not logged in', () => {

    beforeEach(() => {
      return UserLoginManager.logoutUser(server);
    })

    it('logout should succeed', (done) => {
      server.get('/logout')
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

  });

  describe('user logged in', () => {

    beforeEach(() => {
      return UserLoginManager.registerUser(server, userDefinition)
        .then(() => UserLoginManager.loginUser(server, userDefinition))
    });

    it('logout should succeed', (done) => {
      server.get('/logout')
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return UserLoginManager.logoutUser(server);
      });

      it('logout should succeed', (done) => {
        server.get('/logout')
          .expect(StatusCode.REDIRECT)
          .expect('Location', '/')
          .end(done);
      });

      it('getting user details should fail', (done) => {
        server.get('/apiuser')
          .expect(StatusCode.UNAUTHORIZED)
          .end(done);
      });

    });

  });

});
