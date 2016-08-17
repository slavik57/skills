import {NotFoundError} from "../../common/errors/notFoundError";
import {TeamMember} from "../models/teamMember";
import {AddUserToTeamOperation} from "../operations/teamOperations/addUserToTeamOperation";
import {ITeamMemberResponse} from "../apiResponses/iTeamMemberResponse";
import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {GetTeamUsersOperation} from "../operations/teamOperations/getTeamUsersOperation";
import {UpdateTeamNameOperation} from "../operations/teamOperations/updateTeamNameOperation";
import {RemoveTeamOperation} from "../operations/teamOperations/removeTeamOperation";
import {GetTeamByNameOperation} from "../operations/teamOperations/getTeamByNameOperation";
import {AlreadyExistsError} from "../../common/errors/alreadyExistsError";
import {UnauthorizedError} from "../../common/errors/unauthorizedError";
import {ErrorUtils} from "../../common/errors/errorUtils";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {AddTeamOperation} from "../operations/teamOperations/addTeamOperation";
import {GetTeamsOperation} from "../operations/teamOperations/getTeamsOperation";
import {ITeamInfoResponse} from "../apiResponses/iTeamInfoResponse";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {Team} from "../models/team";
import { Express, Request, Response } from 'express';
import * as _ from 'lodash';

interface ICreateTeamRequestBody {
  name: string;
}

interface IUpdateTeamRequestBody {
  name: string;
}

interface IAddTeamMemberRequestBody {
  username: string;
}

export = {
  get_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var operation = new GetTeamsOperation();

    operation.execute()
      .then((_teams: Team[]) => {
        return _.map(_teams, (_team: Team) => {
          return <ITeamInfoResponse>{
            id: _team.id,
            teamName: _team.attributes.name
          }
        });
      })
      .then((_teamInfoResponses: ITeamInfoResponse[]) => {
        return _teamInfoResponses.sort((_info1, _info2) => _info1.id - _info2.id)
      })
      .then((_teamInfoResponses: ITeamInfoResponse[]) => {
        response.json(_teamInfoResponses);
      });
  }],
  get_teamName_exists: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, teamName: string): void {
    var operation = new GetTeamByNameOperation(teamName);

    operation.execute()
      .then((team: Team) => {
        var teamExists = !!team;
        response.send({
          teamExists: teamExists
        });
      });
  }],
  post_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var createTeamRequest: ICreateTeamRequestBody = request.body;

    if (!createTeamRequest || !createTeamRequest.name) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }
    var teamInfo: ITeamInfo = {
      name: createTeamRequest.name
    }

    var addOperation = new AddTeamOperation(teamInfo, request.user.id);
    addOperation.execute()
      .then((_team: Team) => {
        response.status(StatusCode.OK);
        response.send(<ITeamInfoResponse>{
          id: _team.id,
          teamName: _team.attributes.name
        });
      }, (error: any) => {
        var statusCode = StatusCode.INTERNAL_SERVER_ERROR;

        if (ErrorUtils.isErrorOfType(error, UnauthorizedError)) {
          statusCode = StatusCode.UNAUTHORIZED;
        } else if (ErrorUtils.isErrorOfType(error, AlreadyExistsError)) {
          statusCode = StatusCode.CONFLICT;
        }

        response.status(statusCode);
        response.send();
      })
  }],
  post_teamId_members: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, teamId: string) {
    var numberId: number = Number(teamId);

    var addTeamMemberRequest: IAddTeamMemberRequestBody = request.body;

    if (!addTeamMemberRequest || !addTeamMemberRequest.username) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }

    const operation =
      new AddUserToTeamOperation(addTeamMemberRequest.username, numberId, false, request.user.id);

    operation.execute()
      .then((_teamMember: TeamMember) => {
        response.status(StatusCode.OK);
        response.send(<ITeamMemberResponse>{
          id: _teamMember.attributes.user_id,
          username: addTeamMemberRequest.username,
          isAdmin: _teamMember.attributes.is_admin
        });
      }, (error: any) => {
        var statusCode = StatusCode.INTERNAL_SERVER_ERROR;

        var errorDescription: any;
        if (ErrorUtils.isErrorOfType(error, UnauthorizedError)) {
          statusCode = StatusCode.UNAUTHORIZED;
        } else if (ErrorUtils.isErrorOfType(error, NotFoundError)) {
          statusCode = StatusCode.NOT_FOUND;
        } else if (ErrorUtils.isErrorOfType(error, AlreadyExistsError)) {
          statusCode = StatusCode.CONFLICT;
          errorDescription = { error: 'The user is already in the team' };
        }

        response.status(statusCode);
        response.send(errorDescription);
      })
  }],
  put_teamId_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, teamId: string) {
    var updateTeamRequest: IUpdateTeamRequestBody = request.body;

    if (!updateTeamRequest || !updateTeamRequest.name) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }

    var numberId: number = Number(teamId);

    var opearation =
      new UpdateTeamNameOperation(numberId, updateTeamRequest.name, request.user.id);

    opearation.execute()
      .then((_team: Team) => {
        response.status(StatusCode.OK);
        response.send(<ITeamInfoResponse>{
          id: _team.id,
          teamName: _team.attributes.name
        });
      }, (error: any) => {
        var statusCode = StatusCode.INTERNAL_SERVER_ERROR;

        if (ErrorUtils.isErrorOfType(error, UnauthorizedError)) {
          statusCode = StatusCode.UNAUTHORIZED;
        } else if (ErrorUtils.isErrorOfType(error, AlreadyExistsError)) {
          statusCode = StatusCode.CONFLICT;
        }

        response.status(statusCode);
        response.send();
      })
  }],
  delete_teamId_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, teamId: string) {
    var numberId = Number(teamId);

    var operation = new RemoveTeamOperation(numberId, request.user.id);

    operation.execute()
      .then(() => {
        response.status(StatusCode.OK);
        response.send();
      }, (error) => {
        if (ErrorUtils.isErrorOfType(error, UnauthorizedError)) {
          response.status(StatusCode.UNAUTHORIZED);
        } else {
          response.status(StatusCode.INTERNAL_SERVER_ERROR);
        }

        response.send();
      });
  }],
  get_teamId_members: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, teamId: string) {
    var numberId = Number(teamId);

    var operation = new GetTeamUsersOperation(numberId);

    operation.execute()
      .then((_teamMembers: IUserOfATeam[]) => {
        var result: ITeamMemberResponse[] = _.map(_teamMembers, (_teamMember) => {
          return <ITeamMemberResponse>{
            id: _teamMember.user.id,
            username: _teamMember.user.attributes.username,
            isAdmin: _teamMember.isAdmin
          }
        }).sort((_info1, _info2) => _info1.id - _info2.id);

        response.json(result);
      });
  }]
};
