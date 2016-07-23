"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var GlobalPermissionConverter = (function () {
    function GlobalPermissionConverter() {
    }
    GlobalPermissionConverter.convertToUserPermissionResponse = function (permission) {
        var name = this._getName(permission);
        var description = this._getDescription(permission);
        return {
            value: permission,
            name: name,
            descrition: description
        };
    };
    GlobalPermissionConverter._getName = function (permission) {
        switch (permission) {
            case globalPermission_1.GlobalPermission.ADMIN:
                return 'Admin';
            case globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN:
                return 'Teams list admin';
            case globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN:
                return 'Skills list admin';
            case globalPermission_1.GlobalPermission.READER:
                return 'Reader';
            case globalPermission_1.GlobalPermission.GUEST:
                return 'Guest';
            default:
                return 'Unknown permission';
        }
    };
    GlobalPermissionConverter._getDescription = function (permission) {
        switch (permission) {
            case globalPermission_1.GlobalPermission.ADMIN:
                return 'Can do anything';
            case globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN:
                return 'Can create/destroy teams';
            case globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN:
                return 'Can create/destroy skills';
            case globalPermission_1.GlobalPermission.READER:
                return 'Registered user';
            case globalPermission_1.GlobalPermission.GUEST:
                return 'Unregistered user';
            default:
                return 'Unknown permission';
        }
    };
    return GlobalPermissionConverter;
}());
exports.GlobalPermissionConverter = GlobalPermissionConverter;
//# sourceMappingURL=globalPermissionConverter.js.map