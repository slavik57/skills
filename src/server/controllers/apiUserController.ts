import { Express, Request, Response } from 'express';
import {PathHelper} from '../../common/pathHelper';

export = {
  get_index: function(request: Request, response: Response): void {
    response.json(request.user);
  }
};
