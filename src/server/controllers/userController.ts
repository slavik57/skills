import {Authenticator} from "../expressMiddlewares/authenticator";
import {User} from "../models/user";
import {GetUserOperation} from "../operations/userOperations/getUserOperation";
import { Express, Request, Response } from 'express';
import {PathHelper} from '../../common/pathHelper';

export = {
  get_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    response.json(request.user);
  }],
  get_username_exists: function(request: Request, response: Response, username: string): void {
    var operation = new GetUserOperation(username);

    operation.execute()
      .then((user: User) => {
        var userExists = !!user;
        response.send({
          userExists: userExists
        });
      });
  }
};
