import {CreateUserOperation} from "../operations/userOperations/createUserOperation";
import { Express, Request, Response, Handler, NextFunction } from 'express';
import {PathHelper} from '../../common/pathHelper';
import {ExpressServer} from '../expressServer';

export = {
  get_index: function(request: Request, response: Response): void {
    var webpackMiddleware = ExpressServer.instance.webpackMiddleware;

    response.write(webpackMiddleware.fileSystem.readFileSync(PathHelper.getPathFromRoot('dist', 'signin.html')));

    response.end();
  }
};
