import {LoginUserOperation} from "../operations/userOperations/loginUserOperation";
import {CreateUserOperation} from "../operations/userOperations/createUserOperation";
import { Express, Request, Response, Handler, NextFunction } from 'express';

export = {
  get_index: function(request: Request, response: Response): void {
    response.render('signin');
  },

  post_login: function(request: Request, response: Response): void {
    var operation = new LoginUserOperation(request.body.username,
      request.body.password);

    operation.execute().then(
      () => {
        response.redirect('/');
      },
      (_error) => {
        response.send(_error);
      });
  },

  post_register: function(request: Request, response: Response): void {
    var operation = new CreateUserOperation(request.body.username,
      request.body.password,
      request.body.email,
      request.body.firstName,
      request.body.lastName);

    operation.execute().then(
      () => {
        response.redirect('/');
      },
      (_error) => {
        response.send(_error);
      });
  }
};
