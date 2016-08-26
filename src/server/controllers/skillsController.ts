import {GetSkillByNameOperation} from "../operations/skillsOperations/getSkillByNameOperation";
import {RemoveSkillOperation} from "../operations/skillsOperations/removeSkillOperation";
import {AlreadyExistsError} from "../../common/errors/alreadyExistsError";
import {UnauthorizedError} from "../../common/errors/unauthorizedError";
import {ErrorUtils} from "../../common/errors/errorUtils";
import {AddSkillOperation} from "../operations/skillsOperations/addSkillOperation";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {ISkillInfoResponse} from "../apiResponses/iSkillInfoResponse";
import {Skill} from "../models/skill";
import {GetSkillsOperation} from "../operations/skillsOperations/getSkillsOperation";
import {StatusCode} from "../enums/statusCode";
import {Authenticator} from "../expressMiddlewares/authenticator";
import { Express, Request, Response } from 'express';
import * as _ from 'lodash';

interface ICreateSkillRequestBody {
  name: string;
}

export = {
  get_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var operation = new GetSkillsOperation();

    operation.execute()
      .then((_skills: Skill[]) => {
        return _.map(_skills, (_skill: Skill) => {
          return <ISkillInfoResponse>{
            id: _skill.id,
            skillName: _skill.attributes.name
          }
        });
      })
      .then((_skillInfoResponses: ISkillInfoResponse[]) => {
        return _skillInfoResponses.sort((_info1, _info2) => _info1.id - _info2.id)
      })
      .then((_skillInfoResponses: ISkillInfoResponse[]) => {
        response.json(_skillInfoResponses);
      });
  }],
  get_skillName_exists: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillName: string): void {
    var operation = new GetSkillByNameOperation(skillName);

    operation.execute()
      .then((_skill: Skill) => {
        var skillExists = !!_skill;
        response.send({
          skillExists: skillExists
        });
      });
  }],
  post_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response): void {
    var createSkillRequest: ICreateSkillRequestBody = request.body;

    if (!createSkillRequest || !createSkillRequest.name) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }
    var skillInfo: ISkillInfo = {
      name: createSkillRequest.name
    }

    var addOperation = new AddSkillOperation(request.user.id, skillInfo);
    addOperation.execute()
      .then((_skill: Skill) => {
        response.status(StatusCode.OK);
        response.send(<ISkillInfoResponse>{
          id: _skill.id,
          skillName: _skill.attributes.name
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
  delete_skillId_index: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillId: string) {
    var numberId = Number(skillId);

    var operation = new RemoveSkillOperation(request.user.id, numberId);

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
};
