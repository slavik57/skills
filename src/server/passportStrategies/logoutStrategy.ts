import {User} from "../models/user";
import {ISessionRequest} from "./interfaces/iSessionRequest";
import * as passport from 'passport';
import {Strategy, IVerifyOptions, IStrategyOptionsWithRequest} from 'passport-local'
import {LoginUserOperation} from "../operations/userOperations/loginUserOperation";
import { Express} from 'express';

export class LogoutStrategy {
  private static NAME = 'logout';

  public static initialize(app: Express): void {
    app.get('/logout', function(req, res: any) {
      var name = req.user.username;
      console.log("LOGGIN OUT " + req.user.username)
      req.logout();
      res.redirect('/');
      req.session.notice = "You have successfully been logged out " + name + "!";
    });
  }
}
