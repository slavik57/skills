"use strict";
(function (GlobalPermission) {
    GlobalPermission[GlobalPermission['ADMIN'] = 0] = 'ADMIN';
    GlobalPermission[GlobalPermission['TEAMS_LIST_ADMIN'] = 1] = 'TEAMS_LIST_ADMIN';
    GlobalPermission[GlobalPermission['SKILLS_LIST_ADMIN'] = 2] = 'SKILLS_LIST_ADMIN';
    GlobalPermission[GlobalPermission['READER'] = 3] = 'READER';
    GlobalPermission[GlobalPermission['GUEST'] = 4] = 'GUEST';
})(exports.GlobalPermission || (exports.GlobalPermission = {}));
var GlobalPermission = exports.GlobalPermission;
//# sourceMappingURL=globalPermission.js.map