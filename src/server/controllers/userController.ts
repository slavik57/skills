import {IUserPermissionRuleResponse} from "../apiResponses/iUserPermissionRuleResponse";
import {GetAllowedUserPermissionsToModifyOperation} from "../operations/userOperations/getAllowedUserPermissionsToModifyOperation";
import {GlobalPermissionConverter} from "../enums/globalPermissionConverter";
import {IUserPermissionResponse} from "../apiResponses/iUserPermissionResponse";
import {GlobalPermission} from "../models/enums/globalPermission";
import {GetUserPermissionsOperation} from "../operations/userOperations/getUserPermissionsOperation";
import {UpdateUserPasswordOperation} from "../operations/userOperations/updateUserPasswordOperation";
import {UserRequestIdValidator} from "../../common/userRequestIdValidator";
import {GetUserByIdOperation} from "../operations/userOperations/getUserByIdOperation";
import {UpdateUserDetailsOperation} from "../operations/userOperations/updateUserDetailsOperation";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {User} from "../models/user";
import {GetUserOperation} from "../operations/userOperations/getUserOperation";
import { Express, Request, Response } from 'express';
import {PathHelper} from '../../common/pathHelper';
import * as _ from 'lodash';
import {EnumValues} from 'enum-values';

interface IUpdateUserDetailsDefinition {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface IUpdateUserPasswordDefinition {
  password: string;
  newPassword: string;
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

    if (!UserRequestIdValidator.isRequestFromUser(request, id)) {
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
  }],
  put_id_password: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, id: string): void {
    var updateUserPassword = <IUpdateUserPasswordDefinition>request.body;

    if (!UserRequestIdValidator.isRequestFromUser(request, id)) {
      response.status(StatusCode.UNAUTHORIZED).send();
      return;
    }

    var numberId: number = Number(id);

    var operation =
      new UpdateUserPasswordOperation(
        numberId,
        updateUserPassword.password,
        updateUserPassword.newPassword);

    operation.execute()
      .then(() => response.status(StatusCode.OK).send(),
      (error: any) => {
        var statusCode = StatusCode.BAD_REQUEST;
        if (error === 'Wrong password') {
          statusCode = StatusCode.UNAUTHORIZED;
        }

        return response.status(statusCode).send({ error: error });
      });
  }],
  get_userId_permissions: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, userId: string): void {
    var numberId: number = Number(userId);

    var operation = new GetUserPermissionsOperation(numberId);

    operation.execute()
      .then((permissions: GlobalPermission[]) => {
        var permissionsNames: IUserPermissionResponse[] =
          _.map(permissions, _permission => GlobalPermissionConverter.convertToUserPermissionResponse(_permission));

        response.send(permissionsNames.sort((_1, _2) => _1.value - _2.value));
      });
  }],
  get_permissionsModificationRules: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var operation = new GetAllowedUserPermissionsToModifyOperation(request.user.id);

    operation.execute()
      .then((permissions: GlobalPermission[]) => {
        var allPermissions: GlobalPermission[] = EnumValues.getValues(GlobalPermission);

        var result: IUserPermissionRuleResponse[] =
          _.map(allPermissions, _permission => GlobalPermissionConverter.convertToUserPermissionResponse(_permission))
            .map(_userPermissionResult => {
              return <IUserPermissionRuleResponse>{
                value: _userPermissionResult.value,
                name: _userPermissionResult.name,
                description: _userPermissionResult.description,
                allowedToChange: permissions.indexOf(_userPermissionResult.value) >= 0
              }
            })

        response.send(result.sort((_1, _2) => _1.value - _2.value));
      });
  }]
};
