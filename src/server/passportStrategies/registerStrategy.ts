import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {IUserRegistrationDefinition} from "./interfaces/iUserRegistrationDefinition";
import {StatusCode} from "../enums/statusCode";
import {User} from "../models/user";
import * as passport from 'passport';
import {Strategy, IVerifyOptions, IStrategyOptionsWithRequest} from 'passport-local'
import {CreateUserOperation} from "../operations/userOperations/createUserOperation";
import {Response, Request, NextFunction, Express} from 'express';

export class RegisterStrategy {
  private static NAME = 'register';

  public static initialize(app: Express): void {
    app.post('/register', (request: Request, response: Response, nextFunction: NextFunction) => {

      var authenticateHandler =
        passport.authenticate(RegisterStrategy.NAME, (_error, _user) => this._handleRegistrationResult(_error, _user, request, response, nextFunction));

      authenticateHandler(request, response, nextFunction);
    });

    var options: IStrategyOptionsWithRequest = {
      passReqToCallback: true
    }

    passport.use(RegisterStrategy.NAME, new Strategy(options, this._registerUser));
  }

  private static _handleRegistrationResult(error: any, user: any, request: Request, response: Response, nextFunction: NextFunction): any {
    if (error) {
      return nextFunction(error);
    }

    if (!user) {
      return response.status(StatusCode.BAD_REQUEST).send();
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

  private static _registerUser(req: Request, username: string, password: string, done: (error: any, user?: IUserInfoResponse, options?: IVerifyOptions) => void) {

    var userRegistrationDefinition = <IUserRegistrationDefinition>req.body;

    var operation = new CreateUserOperation(username,
      password,
      userRegistrationDefinition.email,
      userRegistrationDefinition.firstName,
      userRegistrationDefinition.lastName);

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
