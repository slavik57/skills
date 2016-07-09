import {GetUserByIdOperation} from "../operations/userOperations/getUserByIdOperation";
import {UpdateUserDetailsOperation} from "../operations/userOperations/updateUserDetailsOperation";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {User} from "../models/user";
import {GetUserOperation} from "../operations/userOperations/getUserOperation";
import { Express, Request, Response } from 'express';
import {PathHelper} from '../../common/pathHelper';

interface IUpdateUserDetailsDefinition {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export = {
  get_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var operation = new GetUserByIdOperation(request.user.id);

    operation.execute()
      .then((_user: User) => {
        response.json({
          id: _user.id,
          username: _user.attributes.username,
          email: _user.attributes.email,
          firstName: _user.attributes.firstName,
          lastName: _user.attributes.lastName
        })
      });
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
  },
  put_id: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, id: string): void {
    var updateUserDetails = <IUpdateUserDetailsDefinition>request.body;

    if (!request.user ||
      !request.user.id ||
      request.user.id.toString() !== id) {

      response.status(StatusCode.UNAUTHORIZED).send();
      return;
    }

    var numberId: number = Number(id);

    var operation =
      new UpdateUserDetailsOperation(
        numberId,
        updateUserDetails.username,
        updateUserDetails.email,
        updateUserDetails.firstName,
        updateUserDetails.lastName);

    operation.execute()
      .then(() => response.status(StatusCode.OK).send(),
      (error: any) => response.status(StatusCode.BAD_REQUEST).send({ error: error }));
  }]
};
