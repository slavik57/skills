import {ModelBase} from "../models/modelBase";
import * as _ from 'lodash';
import {expect} from 'chai';
import {IModelInfo} from '../models/interfaces/iModelInfo';

export class ModelInfoVerificator {

  public static verifyMultipleInfosOrdered<TInfo extends IModelInfo>(
    actual: TInfo[],
    expected: TInfo[],
    infoComparer: (info1: TInfo, info2: TInfo) => number): void {

    var actualOrdered: TInfo[] = actual.sort(infoComparer);
    var expectedOrdered: TInfo[] = expected.sort(infoComparer);

    expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

    for (var i = 0; i < expected.length; i++) {
      this.verifyInfo(actualOrdered[i], expectedOrdered[i]);
    }
  }

  public static verifyInfo<TInfo extends IModelInfo>(actual: TInfo, expected: TInfo): void {
    var actualCloned: TInfo = _.clone(actual);
    var expectedCloned: TInfo = _.clone(expected);

    delete actualCloned.id;
    delete expectedCloned.id;

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

}
