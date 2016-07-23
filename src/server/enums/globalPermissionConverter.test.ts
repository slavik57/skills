import {IUserPermissionResponse} from "../apiResponses/iUserPermissionResponse";
import {GlobalPermissionConverter} from "./globalPermissionConverter";
import {GlobalPermission} from "../models/enums/globalPermission";
import {expect} from 'chai';
import {EnumValues} from 'enum-values';

describe('GlobalPermissionConverter', () => {

  describe('convertToUserPermissionResponse', () => {

    it('transforming all permissions should have a known value', () => {
      var permissions: GlobalPermission[] = EnumValues.getValues(GlobalPermission);

      permissions.forEach((_permission: GlobalPermission) => {
        var message = 'The permission ' + GlobalPermission[_permission] + ' has no convertion';

        var result: IUserPermissionResponse = GlobalPermissionConverter.convertToUserPermissionResponse(_permission);

        expect(result.value).to.be.equal(_permission);
        expect(result.name, message).to.not.contain('Unknown permission');
        expect(result.descrition, message).to.not.contain('Unknown permission');
      });
    });

  });

});
