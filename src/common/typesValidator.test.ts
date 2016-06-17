import { expect } from 'chai';
import {TypesValidator} from './typesValidator';

describe('TypesValidator', () => {
  describe('isNumber', () => {

    it('1 should return true', () => {
      // Arrange
      var result = TypesValidator.isNumber(1);

      // Assert
      expect(result).to.be.true;
    });

    it('-1 should return true', () => {
      // Arrange
      var result = TypesValidator.isNumber(-1);

      // Assert
      expect(result).to.be.true;
    });

    it('1.1 should return true', () => {
      // Arrange
      var result = TypesValidator.isNumber(1.1);

      // Assert
      expect(result).to.be.true;
    });

    it('-1.1 should return true', () => {
      // Arrange
      var result = TypesValidator.isNumber(-1.1);

      // Assert
      expect(result).to.be.true;
    });

    it('empty string should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber('');

      // Assert
      expect(result).to.be.false;
    });

    it('"1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber('1');

      // Assert
      expect(result).to.be.false;
    });

    it('-1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber('-1');

      // Assert
      expect(result).to.be.false;
    });

    it('"1.1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber('1.1');

      // Assert
      expect(result).to.be.false;
    });

    it('"-1.1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber('-1.1');

      // Assert
      expect(result).to.be.false;
    });

    it('null should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber(null);

      // Assert
      expect(result).to.be.false;
    });

    it('"undefined should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber(undefined);

      // Assert
      expect(result).to.be.false;
    });

    it('{} should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber({});

      // Assert
      expect(result).to.be.false;
    });

    it('[] should return false', () => {
      // Arrange
      var result = TypesValidator.isNumber([]);

      // Assert
      expect(result).to.be.false;
    });

  });

  describe('isInteger', () => {

    it('1 should return true', () => {
      // Arrange
      var result = TypesValidator.isInteger(1);

      // Assert
      expect(result).to.be.true;
    });

    it('-1 should return true', () => {
      // Arrange
      var result = TypesValidator.isInteger(-1);

      // Assert
      expect(result).to.be.true;
    });

    it('1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger(1.1);

      // Assert
      expect(result).to.be.false;
    });

    it('-1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger(-1.1);

      // Assert
      expect(result).to.be.false;
    });

    it('empty string should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger('');

      // Assert
      expect(result).to.be.false;
    });

    it('"1" should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger('1');

      // Assert
      expect(result).to.be.false;
    });

    it('-1" should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger('-1');

      // Assert
      expect(result).to.be.false;
    });

    it('"1.1" should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger('1.1');

      // Assert
      expect(result).to.be.false;
    });

    it('"-1.1" should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger('-1.1');

      // Assert
      expect(result).to.be.false;
    });

    it('null should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger(null);

      // Assert
      expect(result).to.be.false;
    });

    it('"undefined should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger(undefined);

      // Assert
      expect(result).to.be.false;
    });

    it('{} should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger({});

      // Assert
      expect(result).to.be.false;
    });

    it('[] should return false', () => {
      // Arrange
      var result = TypesValidator.isInteger([]);

      // Assert
      expect(result).to.be.false;
    });

  });

  describe('isNullOrUndefined', () => {

    it('1 should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined(1);

      // Assert
      expect(result).to.be.false;
    });

    it('-1 should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined(-1);

      // Assert
      expect(result).to.be.false;
    });

    it('1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined(1.1);

      // Assert
      expect(result).to.be.false;
    });

    it('-1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined(-1.1);

      // Assert
      expect(result).to.be.false;
    });

    it('empty string should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined('');

      // Assert
      expect(result).to.be.false;
    });

    it('"1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined('1');

      // Assert
      expect(result).to.be.false;
    });

    it('-1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined('-1');

      // Assert
      expect(result).to.be.false;
    });

    it('"1.1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined('1.1');

      // Assert
      expect(result).to.be.false;
    });

    it('"-1.1" should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined('-1.1');

      // Assert
      expect(result).to.be.false;
    });

    it('null should return true', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined(null);

      // Assert
      expect(result).to.be.true;
    });

    it('"undefined should return true', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined(undefined);

      // Assert
      expect(result).to.be.true;
    });

    it('{} should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined({});

      // Assert
      expect(result).to.be.false;
    });

    it('[] should return false', () => {
      // Arrange
      var result = TypesValidator.isNullOrUndefined([]);

      // Assert
      expect(result).to.be.false;
    });

  });

  describe('isString', () => {

    it('1 should return false', () => {
      // Arrange
      var result = TypesValidator.isString(1);

      // Assert
      expect(result).to.be.false;
    });

    it('-1 should return false', () => {
      // Arrange
      var result = TypesValidator.isString(-1);

      // Assert
      expect(result).to.be.false;
    });

    it('1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isString(1.1);

      // Assert
      expect(result).to.be.false;
    });

    it('-1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isString(-1.1);

      // Assert
      expect(result).to.be.false;
    });

    it('empty string should return true', () => {
      // Arrange
      var result = TypesValidator.isString('');

      // Assert
      expect(result).to.be.true;
    });

    it('"1" should return true', () => {
      // Arrange
      var result = TypesValidator.isString('1');

      // Assert
      expect(result).to.be.true;
    });

    it('-1" should return true', () => {
      // Arrange
      var result = TypesValidator.isString('-1');

      // Assert
      expect(result).to.be.true;
    });

    it('"1.1" should return true', () => {
      // Arrange
      var result = TypesValidator.isString('1.1');

      // Assert
      expect(result).to.be.true;
    });

    it('"-1.1" should return true', () => {
      // Arrange
      var result = TypesValidator.isString('-1.1');

      // Assert
      expect(result).to.be.true;
    });

    it('null should return false', () => {
      // Arrange
      var result = TypesValidator.isString(null);

      // Assert
      expect(result).to.be.false;
    });

    it('"undefined should return false', () => {
      // Arrange
      var result = TypesValidator.isString(undefined);

      // Assert
      expect(result).to.be.false;
    });

    it('{} should return false', () => {
      // Arrange
      var result = TypesValidator.isString({});

      // Assert
      expect(result).to.be.false;
    });

    it('[] should return false', () => {
      // Arrange
      var result = TypesValidator.isString([]);

      // Assert
      expect(result).to.be.false;
    });

  });

  describe('isString', () => {

    it('1 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString(1, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('-1 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString(-1, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString(1.1, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('-1.1 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString(-1.1, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('empty string with 0 should return true', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('', 0);

      // Assert
      expect(result).to.be.true;
    });

    it('empty string with 1 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('', 1);

      // Assert
      expect(result).to.be.false;
    });

    it('"1" with 1 should return true', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('1', 1);

      // Assert
      expect(result).to.be.true;
    });

    it('"1" with 2 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('1', 2);

      // Assert
      expect(result).to.be.false;
    });

    it('-1" with 2 should return true', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('-1', 2);

      // Assert
      expect(result).to.be.true;
    });

    it('-1" with 3 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('-1', 3);

      // Assert
      expect(result).to.be.false;
    });

    it('"1.1" with 3 should return true', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('1.1', 3);

      // Assert
      expect(result).to.be.true;
    });

    it('"1.1" with 4 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('1.1', 4);

      // Assert
      expect(result).to.be.false;
    });

    it('"-1.1" with 4 should return true', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('-1.1', 4);

      // Assert
      expect(result).to.be.true;
    });

    it('"-1.1" with 5 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString('-1.1', 5);

      // Assert
      expect(result).to.be.false;
    });

    it('null with 0 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString(null, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('"undefined with 0 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString(undefined, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('{} with 0 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString({}, 0);

      // Assert
      expect(result).to.be.false;
    });

    it('[] with 0 should return false', () => {
      // Arrange
      var result = TypesValidator.isLongEnoughString([], 0);

      // Assert
      expect(result).to.be.false;
    });

  });

});
