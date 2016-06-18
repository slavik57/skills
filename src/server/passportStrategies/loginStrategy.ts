import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {StatusCode} from "../enums/statusCode";
import {User} from "../models/user";
import * as passport from 'passport';
import {Strategy, IVerifyOptions, IStrategyOptionsWithRequest} from 'passport-local'
import {LoginUserOperation} from "../operations/userOperations/loginUserOperation";
import {Request, Response, NextFunction, Express} from 'express';

export class LoginStrategy {
  private static NAME = 'login';

  public static initialize(app: Express): void {
    app.post('/login', passport.authenticate(LoginStrategy.NAME, {
      successRedirect: '/'
    }));

    var options: IStrategyOptionsWithRequest = {
      passReqToCallback: true
    }

    passport.use(LoginStrategy.NAME, new Strategy(options, this._loginUser));
  }

  private static _loginUser(req: Request, username: string, password: string, done: (error: any, user?: IUserInfoResponse, options?: IVerifyOptions) => void) {
    var operation = new LoginUserOperation(username, password);

    operation.execute()
      .then((_user: User) => {
        done(null, {
          id: _user.id,
          username: _user.attributes.username,
          firstName: _user.attributes.firstName,
          lastName: _user.attributes.lastName
        });
      })
      .catch((error) => {
        done(null, null);
      });
  }
}
