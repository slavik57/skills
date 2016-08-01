import {ExtendedError} from "./extendedError";
import {UnauthorizedError} from "./unauthorizedError";

export class ErrorUtils {
  public static isErrorOfType(error: any, type: Function): boolean {
    if (error instanceof type) {
      return true;
    }

    while (error instanceof ExtendedError) {
      error = error.innerError;

      if (error instanceof type) {
        return true;
      }
    }

    return false;
  }

}
