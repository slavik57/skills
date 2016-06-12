import {User} from "../models/user";
import {ISessionRequest} from "./interfaces/iSessionRequest";
import * as passport from 'passport';
import {Strategy, IVerifyOptions, IStrategyOptionsWithRequest} from 'passport-local'
import {CreateUserOperation} from "../operations/userOperations/createUserOperation";
import { Express} from 'express';

export class RegisterStrategy {
  private static NAME = 'register';

  public static initialize(app: Express): void {
    app.post('/register', passport.authenticate(RegisterStrategy.NAME, {
      successRedirect: '/',
      failureRedirect: '/signin'
    }));

    var options: IStrategyOptionsWithRequest = {
      passReqToCallback: true
    }

    passport.use(RegisterStrategy.NAME, new Strategy(options, this._registerUser));
  }

  private static _registerUser(req: ISessionRequest, username: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) {

    var operation = new CreateUserOperation(username,
      password,
      req.body.email,
      req.body.firstName,
      req.body.lastName);

    operation.execute()
      .then((_user: User) => {
        req.session.success = 'You are successfully registered and logged in ' + username + '!';
        done(null, { id: _user.id, username: _user.attributes.username });
      })
      .catch((error) => {
        req.session.error = error;
        done(null, null);
      });
  }
}
