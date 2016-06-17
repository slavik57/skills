import {CreateUserOperation} from "../operations/userOperations/createUserOperation";
import { Express, Request, Response, Handler, NextFunction } from 'express';

export = {
  get_index: function(request: Request, response: Response): void {
    response.render('signin');
  }
};
