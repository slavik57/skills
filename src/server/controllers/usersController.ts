import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {GetUsersOperation} from "../operations/userOperations/getUsersOperation";
// import {UpdateUserPasswordOperation} from "../operations/userOperations/updateUserPasswordOperation";
// import {UserRequestIdValidator} from "../../common/userRequestIdValidator";
// import {GetUserByIdOperation} from "../operations/userOperations/getUserByIdOperation";
// import {UpdateUserDetailsOperation} from "../operations/userOperations/updateUserDetailsOperation";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {User} from "../models/user";
import { Express, Request, Response } from 'express';
import * as _ from 'lodash';
// import {PathHelper} from '../../common/pathHelper';

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
  }]
};
