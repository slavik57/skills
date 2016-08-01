import {PermissionsGuestFilter} from "./permissionsGuestFilter";
import {GlobalPermission} from "../server/models/enums/globalPermission";
import {StringManipulator} from "./stringManipulator";
import { expect } from 'chai';

describe('PermissionsGuestFilter', () => {

  it('filter should return the permissions without the gues', () => {
    var permissions: GlobalPermission[] = [
      GlobalPermission.ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN,
      GlobalPermission.GUEST,
      GlobalPermission.READER
    ];

    var expectedPermissions: GlobalPermission[] = [
      GlobalPermission.ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN,
      GlobalPermission.READER
    ];

    expect(PermissionsGuestFilter.filter(permissions)).to.be.deep.equal(expectedPermissions);
  });

});
