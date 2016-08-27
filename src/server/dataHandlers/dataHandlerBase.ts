import {StringManipulator} from "../../common/stringManipulator";

export class DataHandlerBase {

  protected static _createLikeQueryValue(value: string): string {
    var fixedValue = this._fixValueForLikeQuery(value);

    return '%' + fixedValue + '%';
  }

  protected static _fixValueForLikeQuery(value: string): string {
    var noLodash = StringManipulator.replaceAll(value, '_', '\\_');
    var noPercentage = StringManipulator.replaceAll(noLodash, '%', '\\%');

    return noPercentage;
  }
}
