"use strict";
var permissionsGuestFilter_1 = require("./permissionsGuestFilter");
var globalPermission_1 = require("../server/models/enums/globalPermission");
var chai_1 = require('chai');
describe('PermissionsGuestFilter', function () {
    it('filter should return the permissions without the gues', function () {
        var permissions = [
            globalPermission_1.GlobalPermission.ADMIN,
            globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
            globalPermission_1.GlobalPermission.GUEST,
            globalPermission_1.GlobalPermission.READER
        ];
        var expectedPermissions = [
            globalPermission_1.GlobalPermission.ADMIN,
            globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
            globalPermission_1.GlobalPermission.READER
        ];
        chai_1.expect(permissionsGuestFilter_1.PermissionsGuestFilter.filter(permissions)).to.be.deep.equal(expectedPermissions);
    });
});
//# sourceMappingURL=permissionsGuestFilter.test.js.map