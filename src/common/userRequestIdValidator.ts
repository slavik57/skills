import { Request } from 'express';

export class UserRequestIdValidator {
  public static isRequestFromUser(request: Request, userId: string): boolean {
    return !!request &&
      !!request.user &&
      !!request.user.id &&
      request.user.id.toString() === userId;
  }
}
