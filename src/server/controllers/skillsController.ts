import {SkillSelfPrerequisiteError} from "../../common/errors/skillSelfPrerequisiteError";
import {GetSkillsByPartialSkillNameOperation} from "../operations/skillsOperations/getSkillsByPartialSkillNameOperation";
import {ILimitedQuery} from "../apiQueries/iLimitedQuery";
import {RemoveSkillPrerequisiteOperation} from "../operations/skillsOperations/removeSkillPrerequisiteOperation";
import {AddSkillContributionOperation} from "../operations/skillsOperations/addSkillContributionOperation";
import {NotFoundError} from "../../common/errors/notFoundError";
import {SkillPrerequisite} from "../models/skillPrerequisite";
import {AddSkillPrerequisiteOperation} from "../operations/skillsOperations/addSkillPrerequisiteOperation";
import {GetSkillContributionsOperation} from "../operations/skillsOperations/getSkillContributionsOperation";
import {GetSkillPrerequisitesOperation} from "../operations/skillsOperations/getSkillPrerequisitesOperation";
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

interface IAddSkillPrerequisiteRequestBody {
  skillName: string;
}

interface IAddSkillDependencyRequestBody {
  skillName: string;
}

interface IRemovePrerequisiteRequestBody {
  prerequisiteId: number;
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
  get_skillId_prerequisites: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillId: string) {
    var numberId = Number(skillId);

    var operation = new GetSkillPrerequisitesOperation(numberId);

    operation.execute()
      .then((_prerequisites: Skill[]) => {
        var result: ISkillInfoResponse[] = _.map(_prerequisites, (_prerequiste) => {
          return <ISkillInfoResponse>{
            id: _prerequiste.id,
            skillName: _prerequiste.attributes.name,
          }
        }).sort((_info1, _info2) => _info1.id - _info2.id);

        response.json(result);
      });
  }],
  get_skillId_dependencies: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillId: string) {
    var numberId = Number(skillId);

    var operation = new GetSkillContributionsOperation(numberId);

    operation.execute()
      .then((_contributions: Skill[]) => {
        var result: ISkillInfoResponse[] = _.map(_contributions, (_contribution) => {
          return <ISkillInfoResponse>{
            id: _contribution.id,
            skillName: _contribution.attributes.name,
          }
        }).sort((_info1, _info2) => _info1.id - _info2.id);

        response.json(result);
      });
  }],
  post_skillId_prerequisites: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillId: string) {
    var numberId: number = Number(skillId);

    var addSkillPrerequisiteRequest: IAddSkillPrerequisiteRequestBody = request.body;

    if (!addSkillPrerequisiteRequest || !addSkillPrerequisiteRequest.skillName) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }

    const operation =
      new AddSkillPrerequisiteOperation(numberId, addSkillPrerequisiteRequest.skillName, request.user.id);

    operation.execute()
      .then((_prerequisite: SkillPrerequisite) => {
        response.status(StatusCode.OK);
        response.send(<ISkillInfoResponse>{
          id: _prerequisite.attributes.skill_prerequisite_id,
          skillName: addSkillPrerequisiteRequest.skillName,
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
          errorDescription = { error: 'The skill is already a prerequisite' };
        } else if (ErrorUtils.isErrorOfType(error, SkillSelfPrerequisiteError)) {
          statusCode = StatusCode.BAD_REQUEST;
          errorDescription = { error: 'Skill cannot be a prerequisite of itself' };
        }

        response.status(statusCode);
        response.send(errorDescription);
      })
  }],
  post_skillId_dependencies: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillId: string) {
    var numberId: number = Number(skillId);

    var addSkillDependencyRequest: IAddSkillDependencyRequestBody = request.body;

    if (!addSkillDependencyRequest || !addSkillDependencyRequest.skillName) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }

    const operation =
      new AddSkillContributionOperation(numberId, addSkillDependencyRequest.skillName, request.user.id);

    operation.execute()
      .then((_prerequisite: SkillPrerequisite) => {
        response.status(StatusCode.OK);
        response.send(<ISkillInfoResponse>{
          id: _prerequisite.attributes.skill_id,
          skillName: addSkillDependencyRequest.skillName,
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
          errorDescription = { error: 'The skill is already a dependency' };
        } else if (ErrorUtils.isErrorOfType(error, SkillSelfPrerequisiteError)) {
          statusCode = StatusCode.BAD_REQUEST;
          errorDescription = { error: 'Skill cannot be a dependency of itself' };
        }

        response.status(statusCode);
        response.send(errorDescription);
      })
  }],
  delete_skillId_prerequisites: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillId: string) {
    var numberId: number = Number(skillId);

    var removePrerequisiteRequest: IRemovePrerequisiteRequestBody = request.body;

    if (!removePrerequisiteRequest || !removePrerequisiteRequest.prerequisiteId) {
      response.status(StatusCode.BAD_REQUEST);
      response.send();
      return;
    }

    const operation =
      new RemoveSkillPrerequisiteOperation(numberId, removePrerequisiteRequest.prerequisiteId, request.user.id);

    operation.execute()
      .then(() => {
        response.status(StatusCode.OK);
        response.send();
      }, (error: any) => {
        var statusCode = StatusCode.INTERNAL_SERVER_ERROR;
        if (ErrorUtils.isErrorOfType(error, UnauthorizedError)) {
          statusCode = StatusCode.UNAUTHORIZED;
        }

        response.status(statusCode);
        response.send();
      })
  }],
  get_filtered_skillName: [Authenticator.ensureAuthenticated, function(request: Request, response: Response, skillName: string): void {
    var query: ILimitedQuery = request.query;

    var operation = new GetSkillsByPartialSkillNameOperation(skillName, Number(query.max));

    operation.execute()
      .then((_skills: Skill[]) => {
        return _.map(_skills, (_skill: Skill) => {
          return <ISkillInfoResponse>{
            id: _skill.id,
            skillName: _skill.attributes.name
          }
        });
      })
      .then((_userInfoResponses: ISkillInfoResponse[]) => {
        response.json(_userInfoResponses);
      });
  }],
};
