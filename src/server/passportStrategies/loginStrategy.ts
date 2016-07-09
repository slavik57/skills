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
    app.post('/login', (request: Request, response: Response, nextFunction: NextFunction) => {
      var authenticateHandler =
        passport.authenticate(LoginStrategy.NAME, (_error, _user) => this._handleLoginResult(_error, _user, request, response, nextFunction));

      authenticateHandler(request, response, nextFunction);
    });

    var options: IStrategyOptionsWithRequest = {
      passReqToCallback: true
    }

    passport.use(LoginStrategy.NAME, new Strategy(options, this._loginUser));
  }

  private static _handleLoginResult(error: any, user: any, request: Request, response: Response, nextFunction: NextFunction): any {
    if (error) {
      return nextFunction(error);
    }
    if (!user) {
      return response.status(StatusCode.UNAUTHORIZED).send();
    }

    request.logIn(user, (_error) => {
      if (_error) {
        return nextFunction(_error);
      }

      response.status(StatusCode.OK);
      response.setHeader('redirect-path', '/');
      response.send();
    });
  }

  private static _loginUser(req: Request, username: string, password: string, done: (error: any, user?: IUserInfoResponse, options?: IVerifyOptions) => void) {
    var operation = new LoginUserOperation(username, password);

    operation.execute()
      .then((_user: User) => {
        done(null, {
          id: _user.id
        });
      })
      .catch((error) => {
        done(null, null);
      });
  }
}
