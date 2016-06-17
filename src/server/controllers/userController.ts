import { Express, Request, Response } from 'express';
import {PathHelper} from '../../common/pathHelper';
import {webpackMiddlewareInstance} from '../server';

export = {
  get_index: function(request: Request, response: Response): void {
    response.json(request.user);
  }
};
