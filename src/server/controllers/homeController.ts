import { Express, Request, Response } from 'express';
import {PathHelper} from '../../common/pathHelper';
import {ExpressServer} from '../expressServer';

export = {
  get_index: function(request: Request, response: Response): void {
    var webpackMiddleware = ExpressServer.instance.webpackMiddleware;

    response.write(webpackMiddleware.fileSystem.readFileSync(PathHelper.getPathFromRoot('dist', 'home.html')));

    response.end();
  }
};
