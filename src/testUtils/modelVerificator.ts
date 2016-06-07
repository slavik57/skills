import {ModelInfoVerificator} from "./modelInfoVerificator";
import {ModelBase} from "../models/modelBase";
import * as _ from 'lodash';
import {expect} from 'chai';
import {IModelInfo} from '../models/interfaces/iModelInfo';

export class ModelVerificator {
  public static verifyMultipleModelInfosOrderedAsync<TModel extends ModelBase<TModel, TInfo>, TInfo>(
    actualModelsPromise: Promise<TModel[]>,
    expectedInfos: TInfo[],
    infoComparer: (info1: TInfo, info2: TInfo) => number): Promise<void> {

    return expect(actualModelsPromise).to.eventually.fulfilled
      .then((models: TModel[]) => {

        var actualInfos: TInfo[] = _.map(models, _ => _.attributes);

        ModelInfoVerificator.verifyMultipleInfosOrdered(actualInfos, expectedInfos, infoComparer);
      });
  }

  public static verifyModelInfoAsync<TModel extends ModelBase<TModel, TInfo>, TInfo>(actualModelPromise: Promise<TModel>,
    expectedInfo: TInfo): Promise<void> {

    return expect(actualModelPromise).to.eventually.fulfilled
      .then((model: TModel) => {
        ModelInfoVerificator.verifyInfo(model.attributes, expectedInfo);
      });
  }
}