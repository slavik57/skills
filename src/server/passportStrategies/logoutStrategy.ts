import {User} from "../models/user";
import * as passport from 'passport';
import {Strategy, IVerifyOptions, IStrategyOptionsWithRequest} from 'passport-local'
import {LoginUserOperation} from "../operations/userOperations/loginUserOperation";
import { Express} from 'express';

export class LogoutStrategy {
  private static NAME = 'logout';

  public static initialize(app: Express): void {
    app.get('/logout', function(req, res: any) {
      req.logout();
      res.redirect('/');
    });
  }
}
