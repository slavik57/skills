import {StatusCode} from "../enums/statusCode";
import {Request, Response, NextFunction} from 'express';


export class Authenticator {
  public static ensureAuthenticated(request: Request, response: Response, nextFunction: NextFunction): void {
    if (request.isAuthenticated()) {
      nextFunction();
      return;
    }

    response.status(StatusCode.UNAUTHORIZED).send();
  }
}
