import {TeamCreators} from "../models/teamCreator";
import {SkillCreators} from "../models/skillCreator";
import {TeamSkillUpvotes} from "../models/teamSkillUpvote";
import {TeamSkills} from "../models/teamSkill";
import {SkillPrerequisites} from "../models/skillPrerequisite";
import {Skills} from "../models/skill";
import {Teams} from "../models/team";
import {Users} from "../models/user";
import {TeamMembers} from "../models/teamMember";
import {UsersGlobalPermissions} from "../models/usersGlobalPermissions";
import * as bluebirdPromise from 'bluebird';

export class EnvironmentCleaner {
  public static clearTables(): bluebirdPromise<any> {

    return this._clearLevel3Tables()
      .then(() => this._clearLevel2Tables())
      .then(() => this._clearLevel1Tables())
      .then(() => this._clearLevel0Tables());
  }

  private static _clearLevel3Tables(): bluebirdPromise<any> {
    return TeamSkillUpvotes.clearAll();
  }

  private static _clearLevel2Tables(): bluebirdPromise<any> {
    return bluebirdPromise.all([
      SkillPrerequisites.clearAll(),
      TeamSkills.clearAll(),
      SkillCreators.clearAll(),
      TeamCreators.clearAll()
    ]);
  }

  private static _clearLevel1Tables(): bluebirdPromise<any> {
    return bluebirdPromise.all([
      UsersGlobalPermissions.clearAll(),
      TeamMembers.clearAll(),
      Skills.clearAll()
    ]);
  }

  private static _clearLevel0Tables(): bluebirdPromise<any> {
    return bluebirdPromise.all([
      Users.clearAll(),
      Teams.clearAll()
    ]);
  }
}
