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
  }]
};