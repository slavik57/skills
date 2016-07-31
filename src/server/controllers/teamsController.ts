import {GetTeamsOperation} from "../operations/teamOperations/getTeamsOperation";
import {ITeamInfoResponse} from "../apiResponses/iTeamInfoResponse";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import {Team} from "../models/team";
import { Express, Request, Response } from 'express';
import * as _ from 'lodash';

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
        response.json(_teamInfoResponses);
      });
  }]
};
