import {CreateUserOperation} from "../operations/userOperations/createUserOperation";
import { Express, Request, Response, Handler, NextFunction } from 'express';
import {PathHelper} from '../../common/pathHelper';
import {webpackMiddlewareInstance} from '../server';

export = {
  get_index: function(request: Request, response: Response): void {
    response.write(webpackMiddlewareInstance.fileSystem.readFileSync(PathHelper.getPathFromRoot('dist', 'signin.html')));
    response.end();
  }
};
