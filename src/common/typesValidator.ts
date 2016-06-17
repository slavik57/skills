export class TypesValidator {
  public static isNumber(value: any): boolean {
    return typeof value === 'number' &&
      !isNaN(value) &&
      isFinite(value);
  }

  public static isInteger(value: any): boolean {
    if (!TypesValidator.isNumber(value)) {
      return false;
    }
    return /^-?\d+$/.test(value);
  }

  public static isNullOrUndefined(value: any): boolean {
    return value === null ||
      value === undefined;
  }

  public static isString(value: any): boolean {
    return typeof value == 'string';
  }

  public static isLongEnoughString(value: any, minLength: number): boolean {
    return TypesValidator.isString(value) &&
      (<string>value).length >= minLength;
  }
}
