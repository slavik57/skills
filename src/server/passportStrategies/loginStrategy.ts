import {User} from "../models/user";
import {ISessionRequest} from "./interfaces/iSessionRequest";
import * as passport from 'passport';
import {Strategy, IVerifyOptions, IStrategyOptionsWithRequest} from 'passport-local'
import {LoginUserOperation} from "../operations/userOperations/loginUserOperation";
import { Express} from 'express';

export class LoginStrategy {
  private static NAME = 'login';

  public static initialize(app: Express): void {
    app.post('/login', passport.authenticate(LoginStrategy.NAME, {
      successRedirect: '/',
      failureRedirect: '/signin'
    }));

    var options: IStrategyOptionsWithRequest = {
      passReqToCallback: true
    }

    passport.use(LoginStrategy.NAME, new Strategy(options, this._loginUser));
  }

  private static _loginUser(req: ISessionRequest, username: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) {
    var operation = new LoginUserOperation(username, password);

    operation.execute()
      .then((_user: User) => {
        req.session.success = 'You are successfully logged in ' + username + '!';
        done(null, { id: _user.id, username: _user.attributes.username });
      })
      .catch((error) => {
        req.session.error = error;
        done(null, null);
      });
  }
}
