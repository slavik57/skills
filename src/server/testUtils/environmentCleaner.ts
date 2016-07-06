import {SkillCreators} from "../models/skillCreator";
import {TeamSkillUpvotes} from "../models/teamSkillUpvote";
import {TeamSkills} from "../models/teamSkill";
import {SkillPrerequisites} from "../models/skillPrerequisite";
import {Skills} from "../models/skill";
import {Teams} from "../models/team";
import {Users} from "../models/user";
import {TeamMembers} from "../models/teamMember";
import {UsersGlobalPermissions} from "../models/usersGlobalPermissions";

export class EnvironmentCleaner {
  public static clearTables(): Promise<any> {

    return this._clearLevel3Tables()
      .then(() => this._clearLevel2Tables())
      .then(() => this._clearLevel1Tables())
      .then(() => this._clearLevel0Tables());
  }

  private static _clearLevel3Tables(): Promise<any> {
    return TeamSkillUpvotes.clearAll();
  }

  private static _clearLevel2Tables(): Promise<any> {
    return Promise.all([
      SkillPrerequisites.clearAll(),
      TeamSkills.clearAll(),
      SkillCreators.clearAll()
    ]);
  }

  private static _clearLevel1Tables(): Promise<any> {
    return Promise.all([
      UsersGlobalPermissions.clearAll(),
      TeamMembers.clearAll(),
      Skills.clearAll()
    ]);
  }

  private static _clearLevel0Tables(): Promise<any> {
    return Promise.all([
      Users.clearAll(),
      Teams.clearAll()
    ]);
  }
}
