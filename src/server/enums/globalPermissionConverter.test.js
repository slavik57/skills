"use strict";
var globalPermissionConverter_1 = require("./globalPermissionConverter");
var globalPermission_1 = require("../models/enums/globalPermission");
var chai_1 = require('chai');
var enum_values_1 = require('enum-values');
describe('GlobalPermissionConverter', function () {
    describe('convertToUserPermissionResponse', function () {
        it('transforming all permissions should have a known value', function () {
            var permissions = enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission);
            permissions.forEach(function (_permission) {
                var message = 'The permission ' + globalPermission_1.GlobalPermission[_permission] + ' has no convertion';
                var result = globalPermissionConverter_1.GlobalPermissionConverter.convertToUserPermissionResponse(_permission);
                chai_1.expect(result.value).to.be.equal(_permission);
                chai_1.expect(result.name, message).to.not.contain('Unknown permission');
                chai_1.expect(result.descrition, message).to.not.contain('Unknown permission');
            });
        });
    });
});
//# sourceMappingURL=globalPermissionConverter.test.js.map