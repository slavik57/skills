import { Express, Request, Response } from 'express';

export = {
  get_index: function(request: Request, response: Response): void {
    response.render('home', { user: request.user });
  }
};
