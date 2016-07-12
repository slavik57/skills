import {UserRequestIdValidator} from "./userRequestIdValidator";
import { expect } from 'chai';
import { Request } from 'express';

describe('UserRequestIdValidator', () => {

  var request: Request;

  beforeEach(() => {
    request = <any>{
      user: {
        id: 123
      }
    };
  });

  describe('isRequestFromUser', () => {

    it('null request should return false', () => {
      expect(UserRequestIdValidator.isRequestFromUser(null, '1')).to.be.false;
    });

    it('undefined request should return false', () => {
      expect(UserRequestIdValidator.isRequestFromUser(undefined, '1')).to.be.false;
    });

    it('request without user should return false', () => {
      request.user = null;

      expect(UserRequestIdValidator.isRequestFromUser(request, '1')).to.be.false;
    });

    it('request without user id should return false', () => {
      request.user.id = null;

      expect(UserRequestIdValidator.isRequestFromUser(request, '1')).to.be.false;
    });

    it('null user id request should return false', () => {
      expect(UserRequestIdValidator.isRequestFromUser(request, null)).to.be.false;
    });

    it('undefined user id request should return false', () => {
      expect(UserRequestIdValidator.isRequestFromUser(request, undefined)).to.be.false;
    });

    it('empty user id request should return false', () => {
      expect(UserRequestIdValidator.isRequestFromUser(request, '')).to.be.false;
    });

    it('different user id request should return false', () => {
      var otherId = request.user.id + 1;
      expect(UserRequestIdValidator.isRequestFromUser(request, otherId.toString())).to.be.false;
    });

    it('same user id request should return true', () => {
      var id = request.user.id;
      expect(UserRequestIdValidator.isRequestFromUser(request, id.toString())).to.be.true;
    });

  });

});
