"use strict";
var globalPermission_1 = require("../server/models/enums/globalPermission");
var _ = require('lodash');
var PermissionsGuestFilter = (function () {
    function PermissionsGuestFilter() {
    }
    PermissionsGuestFilter.filter = function (permissions) {
        return _.difference(permissions, [globalPermission_1.GlobalPermission.GUEST]);
    };
    return PermissionsGuestFilter;
}());
exports.PermissionsGuestFilter = PermissionsGuestFilter;
//# sourceMappingURL=permissionsGuestFilter.js.map