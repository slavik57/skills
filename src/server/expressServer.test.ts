import {UserDataHandler} from "./dataHandlers/userDataHandler";
import {User} from "./models/user";
import {EnvironmentDirtifier} from "./testUtils/environmentDirtifier";
import {EnvironmentCleaner} from "./testUtils/environmentCleaner";
import {PathHelper} from "../common/pathHelper";
import {ExpressServer} from "./expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as request from 'supertest';
import {Response} from 'supertest';
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

    return logoutUser();
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  function getHomePage(): string {
    return getPage('home.html');
  }

  function getSigninPage(): string {
    return getPage('signin.html');
  }

  function getPage(pageName: string): string {
    var webpackMiddleware = expressServer.webpackMiddleware;

    var buffer = webpackMiddleware.fileSystem.readFileSync(PathHelper.getPathFromRoot('dist', pageName));

    return new Buffer(buffer).toString();
  }

  function registerUser(userDefinition: IUserDefinition): Promise<void> {
    return new Promise((resolveCallback: (value?: void) => void) => {
      server.post('/register')
        .send(userDefinition)
        .end(() => resolveCallback());
    });
  }

  function loginUser(userDefinition: IUserDefinition): Promise<void> {

    return new Promise((resolveCallback: (value?: void) => void) => {
      server.post('/login')
        .send({ username: userDefinition.username, password: userDefinition.password })
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end((error: any, response: Response) => {
          resolveCallback();
        });
    });
  }

  function logoutUser(): Promise<void> {
    return new Promise((resolveCallback: (value?: void) => void) => {
      server.get('/logout')
        .end((error: any, response: Response) => {
          resolveCallback()
        });
    });
  }

  describe('register', () => {

    it('invalid parameters should fail', (done) => {
      userDefinition.email = 'wrong email';

      server.post('/register')
        .send(userDefinition)
        .expect(StatusCode.BAD_REQUEST)
        .end(done);
    });

    it('should create redirect to home page', (done) => {
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

    it('after register, home should be available', (done) => {
      server.post('/register')
        .send(userDefinition)
        .end(() => {
          server.get('/')
            .expect(StatusCode.OK)
            .expect(getHomePage())
            .end(done);
        });
    });

  });

  describe('login', () => {

    beforeEach(() => {
      return registerUser(userDefinition);
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
      return logoutUser();
    })

    it('home should redirect to signin', (done) => {
      server.get('/')
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/signin')
        .end(done);
    });

    it('signin should return html page', (done) => {
      server.get('/signin')
        .expect(StatusCode.OK)
        .expect(getSigninPage())
        .end(done);
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

  describe('user logged in', () => {

    var user: User;

    beforeEach(() => {
      return registerUser(userDefinition)
        .then(() => loginUser(userDefinition))
        .then(() => UserDataHandler.getUserByUsername(userDefinition.username))
        .then((_user: User) => {
          user = _user;
        });
    });

    it('home should return html page', (done) => {
      server.get('/')
        .expect(StatusCode.OK)
        .expect(getHomePage())
        .end(done);
    });

    it('signin should redirect to home', (done) => {
      server.get('/signin')
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

    it('logout should succeed', (done) => {
      server.get('/logout')
        .expect(StatusCode.REDIRECT)
        .expect('Location', '/')
        .end(done);
    });

    it('getting user details should succeed', (done) => {
      var expectedUser = {
        id: user.id,
        username: user.attributes.username
      };

      server.get('/apiuser')
        .expect(StatusCode.OK)
        .expect(expectedUser)
        .end(done);
    });

    describe('logout', () => {

      beforeEach(() => {
        return logoutUser();
      });

      it('home should redirect to signin', (done) => {
        server.get('/')
          .expect(StatusCode.REDIRECT)
          .expect('Location', '/signin')
          .end(done);
      });

      it('signin should return html page', (done) => {
        server.get('/signin')
          .expect(StatusCode.OK)
          .expect(getSigninPage())
          .end(done);
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
