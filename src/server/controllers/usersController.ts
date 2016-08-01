import {UnauthorizedError} from "../../common/errors/unauthorizedError";
import {ErrorUtils} from "../../common/errors/errorUtils";
import {UpdateUserPermissionsOperation} from "../operations/userOperations/updateUserPermissionsOperation";
import {PermissionsGuestFilter} from "../../common/permissionsGuestFilter";
import {GlobalPermissionConverter} from "../enums/globalPermissionConverter";
import {IUserPermissionResponse} from "../apiResponses/iUserPermissionResponse";
import {GlobalPermission} from "../models/enums/globalPermission";
import {GetUserPermissionsOperation} from "../operations/userOperations/getUserPermissionsOperation";
import {GetUserOperation} from "../operations/userOperations/getUserOperation";
import {GetUsersByPartialUsernameOperation} from "../operations/userOperations/getUsersByPartialUsernameOperation";
import {IUserInfoResponse} from "../apiResponses/iUserInfoResponse";
import {GetUsersOperation} from "../operations/userOperations/getUsersOperation";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {User} from "../models/user";
import { Express, Request, Response } from 'express';
import * as _ from 'lodash';

interface IUpdateUserPermissionsDefinition {
  permissionsToAdd: GlobalPermission[];
  permissionsToRemove: GlobalPermission[];
}

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
        return _userInfoResponses.sort((_response1, _response2) => _response1.id - _response2.id)
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
  get_userId_permissions: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, userId: string): void {
    var numberId: number = Number(userId);

    var operation = new GetUserPermissionsOperation(numberId);

    operation.execute()
      .then((permissions: GlobalPermission[]) => {
        var permissionsWithoutGuest: GlobalPermission[] =
          PermissionsGuestFilter.filter(permissions);

        var permissionsNames: IUserPermissionResponse[] =
          _.map(permissionsWithoutGuest, _permission => GlobalPermissionConverter.convertToUserPermissionResponse(_permission));

        response.send(permissionsNames.sort((_1, _2) => _1.value - _2.value));
      });
  }],
  put_userId_permissions: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, userId: string) {
    var numberId: number = Number(userId);
    var updateUserPermissions = <IUpdateUserPermissionsDefinition>request.body;

    var operation = new UpdateUserPermissionsOperation(numberId,
      updateUserPermissions.permissionsToAdd,
      updateUserPermissions.permissionsToRemove,
      request.user.id);

    operation.execute()
      .then(() => response.status(StatusCode.OK).send(),
      (error: any) => {
        var statusCode = StatusCode.INTERNAL_SERVER_ERROR;

        if (ErrorUtils.isErrorOfType(error, UnauthorizedError)) {
          statusCode = StatusCode.UNAUTHORIZED;
        }

        return response.status(statusCode).send({ error: error });
      });
  }]
};
