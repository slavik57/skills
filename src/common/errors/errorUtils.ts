import {ExtendedError} from "./extendedError";
import {UnauthorizedError} from "./unauthorizedError";

export class ErrorUtils {
  public static IsUnautorizedError(error: any): boolean {
    if (error instanceof UnauthorizedError) {
      return true;
    }

    while (error instanceof ExtendedError) {
      error = error.innerError;

      if (error instanceof UnauthorizedError) {
        return true;
      }
    }

    return false;
  }

}
