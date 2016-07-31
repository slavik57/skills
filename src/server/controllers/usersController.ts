import {GetUsersByPartialUsernameOperation} from "../operations/userOperations/getUsersByPartialUsernameOperation";
import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {GetUsersOperation} from "../operations/userOperations/getUsersOperation";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {User} from "../models/user";
import { Express, Request, Response } from 'express';
import * as _ from 'lodash';

export = {
  get_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var operation = new GetUsersOperation();

    operation.execute()
      .then((_users: User[]) => {
        return _.map(_users, (_user: User) => {
          return <IUserInfoResponse>{
            id: _user.id,
            username: _user.attributes.username
          }
        });
      })
      .then((_userInfoResponses: IUserInfoResponse[]) => {
        response.json(_userInfoResponses);
      });
  }],
  get_filtered_username: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, username: string): void {
    var operation = new GetUsersByPartialUsernameOperation(username);

    operation.execute()
      .then((_users: User[]) => {
        return _.map(_users, (_user: User) => {
          return <IUserInfoResponse>{
            id: _user.id,
            username: _user.attributes.username
          }
        });
      })
      .then((_userInfoResponses: IUserInfoResponse[]) => {
        response.json(_userInfoResponses);
      });
  }]
};
