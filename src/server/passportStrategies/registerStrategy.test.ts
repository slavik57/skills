import {UserLoginManager} from "../testUtils/userLoginManager";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ExpressServer} from "../expressServer";
import * as chai from 'chai';
import { expect } from 'chai';
import * as supertest from 'supertest';
import {SuperTest} from 'supertest';
import * as chaiAsPromised from 'chai-as-promised';
import {StatusCode} from '../enums/statusCode';

chai.use(chaiAsPromised);

const timeoutForLoadingServer = 100000;

interface IUserDefinition {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

describe('RegisterStrategy', () => {

  var expressServer: ExpressServer;
  var server: SuperTest;

  var userDefinition: IUserDefinition;

  before(function() {
    this.timeout(timeoutForLoadingServer);

    expressServer = ExpressServer.instance.initialize();

    server = supertest.agent(expressServer.expressApp);
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

});
