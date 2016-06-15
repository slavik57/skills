import {Request} from 'express';

export interface ISessionRequest extends Request {
  session?: any;
}
