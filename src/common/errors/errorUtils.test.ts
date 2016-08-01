import {UnauthorizedError} from "./unauthorizedError";
import {ExtendedError} from "./extendedError";
import {ErrorUtils} from "./errorUtils";
import {expect} from 'chai';

describe('ErrorUrils', () => {

  describe('isErrorOfType', () => {

    it('not error should return false', () => {
      expect(ErrorUtils.isErrorOfType('', UnauthorizedError)).to.be.false;
    });

    it('simple error should return false', () => {
      expect(ErrorUtils.isErrorOfType(new Error(), UnauthorizedError)).to.be.false;
    });

    it('Extended error should return false', () => {
      expect(ErrorUtils.isErrorOfType(new ExtendedError(), UnauthorizedError)).to.be.false;
    });

    it('UnauthorizedError error should return true', () => {
      expect(ErrorUtils.isErrorOfType(new UnauthorizedError(), UnauthorizedError)).to.be.true;
    });

    it('Extended error with inner UnauthorizedError should return true', () => {
      var error = new ExtendedError();
      error.innerError = new UnauthorizedError();
      expect(ErrorUtils.isErrorOfType(error, UnauthorizedError)).to.be.true;
    });

    it('Extended error with inner simple error should return false', () => {
      var error = new ExtendedError();
      error.innerError = new Error();
      expect(ErrorUtils.isErrorOfType(error, UnauthorizedError)).to.be.false;
    });

    it('Extended error with inner inner UnauthorizedError should return true', () => {
      var error = new ExtendedError();
      error.innerError = new ExtendedError();
      error.innerError.innerError = new UnauthorizedError();

      expect(ErrorUtils.isErrorOfType(error, UnauthorizedError)).to.be.true;
    });

  });

});
