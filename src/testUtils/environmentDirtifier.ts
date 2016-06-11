import {TeamSkillUpvote} from "../models/teamSkillUpvote";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {TeamSkill} from "../models/teamSkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {SkillPrerequisite} from "../models/skillPrerequisite";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {TeamMember} from "../models/teamMember";
import {GlobalPermission} from "../models/enums/globalPermission";
import {SkillsDataHandler} from "../dataHandlers/skillsDataHandler";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {Skill} from "../models/skill";
import {Team} from "../models/team";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {User} from "../models/user";
import {ModelInfoMockFactory} from "./modelInfoMockFactory";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {ITestModels} from "./interfaces/iTestModels";
import {UserGlobalPermissions} from '../models/usersGlobalPermissions';
import * as _ from 'lodash';


export class EnvironmentDirtifier {
  private static get numberOfUsers(): number { return 5; }
  private static get numberOfTeams(): number { return 5; }
  private static get numberOfSkills(): number { return 5; }
  private static get permissionsForEachUser(): GlobalPermission[] {
    return [
      GlobalPermission.ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN,
      GlobalPermission.SKILLS_LIST_ADMIN,
      GlobalPermission.READER
    ];
  }

  public static fillAllTables(): Promise<ITestModels> {
    var testModels: ITestModels = {
      users: [],
      skills: [],
      teams: [],
      skillPrerequisites: [],
      userGlobalPermissions: [],
      teamMembers: [],
      teamSkills: [],
      teamSkillUpvotes: []
    };

    return this._fillLevel0Tables(testModels)
      .then(() => this._fillLevel1Tables(testModels))
      .then(() => this._fillLevel2Tables(testModels))
      .then(() => testModels);
  }

  public static createUsers(numberOfUsers: number): Promise<User[]> {
    var userCreationPromises: Promise<User>[] = [];
    for (var i = 0; i < numberOfUsers; i++) {
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(i);

      userCreationPromises.push(UserDataHandler.createUser(userInfo));
    }

    return Promise.all(userCreationPromises);
  }

  public static createSkills(numberOfSkills: number): Promise<Skill[]> {
    var skillCreationPromises: Promise<Skill>[] = [];
    for (var i = 0; i < numberOfSkills; i++) {
      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo(i.toString());

      skillCreationPromises.push(SkillsDataHandler.createSkill(skillInfo));
    }

    return Promise.all(skillCreationPromises);
  }

  public static createSkillPrerequisites(skills: Skill[]): Promise<SkillPrerequisite[]> {
    var skillPrerequisitesCreationPromises: Promise<SkillPrerequisite>[] = [];

    skills.forEach((_skill1: Skill) => {
      skills.forEach((_skill2: Skill) => {
        if (_skill1.id === _skill2.id) {
          return;
        }

        var skillPrerequisiteInfo: ISkillPrerequisiteInfo =
          ModelInfoMockFactory.createSkillPrerequisiteInfo(_skill2, _skill1);

        skillPrerequisitesCreationPromises.push(SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo));
      });
    });

    return Promise.all(skillPrerequisitesCreationPromises);
  }

  public static createTeams(numberOfTeams: number): Promise<Team[]> {
    var teamCreationPromises: Promise<Team>[] = [];
    for (var i = 0; i < numberOfTeams; i++) {
      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo(i.toString());

      teamCreationPromises.push(TeamsDataHandler.createTeam(teamInfo));
    }

    return Promise.all(teamCreationPromises);
  }

  private static _fillLevel0Tables(testModels: ITestModels): Promise<any> {
    return Promise.all([
      this._fillUsers(testModels),
      this._fillTeams(testModels),
      this._fillSkills(testModels)
    ]);
  }

  private static _fillLevel1Tables(testModels: ITestModels): Promise<any> {
    return Promise.all([
      this._fillUsersGlobalPermissions(testModels),
      this._fillTeamMembers(testModels),
      this._fillSkillPrerequisites(testModels),
      this._fillTeamSkills(testModels)
    ]);
  }

  private static _fillLevel2Tables(testModels: ITestModels): Promise<any> {
    return this._fillTeamSkillUpvotes(testModels);
  }

  private static _fillUsers(testModels: ITestModels): Promise<any> {
    return this.createUsers(this.numberOfUsers)
      .then((users: User[]) => {
        testModels.users = users;
      });
  }

  private static _fillTeams(testModels: ITestModels): Promise<any> {
    return this.createTeams(this.numberOfTeams)
      .then((teams: Team[]) => {
        testModels.teams = teams;
      });
  }

  private static _fillSkills(testModels: ITestModels): Promise<any> {
    return this.createSkills(this.numberOfSkills)
      .then((skills: Skill[]) => {
        testModels.skills = skills;
      });
  }

  private static _fillUsersGlobalPermissions(testModels: ITestModels): Promise<any> {
    var permissionsCreationPromises: Promise<UserGlobalPermissions[]>[] = [];

    testModels.users.forEach((_user: User) => {
      var permissionsPromise: Promise<UserGlobalPermissions[]> =
        UserDataHandler.addGlobalPermissions(_user.id, this.permissionsForEachUser);

      permissionsCreationPromises.push(permissionsPromise);
    });

    return Promise.all(permissionsCreationPromises)
      .then((permissions: UserGlobalPermissions[][]) => {
        testModels.userGlobalPermissions = _.flatten(permissions);
      });
  }

  private static _fillTeamMembers(testModels: ITestModels): Promise<any> {
    var teamMembersCreationPromises: Promise<TeamMember>[] = [];

    testModels.users.forEach((_user: User) => {
      testModels.teams.forEach((_team: Team) => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(_team, _user);

        teamMembersCreationPromises.push(TeamsDataHandler.addTeamMember(teamMemberInfo));
      });
    });

    return Promise.all(teamMembersCreationPromises)
      .then((teamMembers: TeamMember[]) => {
        testModels.teamMembers = teamMembers;
      });
  }

  private static _fillSkillPrerequisites(testModels: ITestModels): Promise<any> {
    return this.createSkillPrerequisites(testModels.skills)
      .then((skillPrerequisites: SkillPrerequisite[]) => {
        testModels.skillPrerequisites = skillPrerequisites;
      });
  }

  private static _fillTeamSkills(testModels: ITestModels): Promise<any> {
    var teamSkillsCreationPromises: Promise<TeamSkill>[] = [];

    testModels.teams.forEach((_team: Team) => {
      testModels.skills.forEach((_skill: Skill) => {
        var teamSkillInfo: ITeamSkillInfo =
          ModelInfoMockFactory.createTeamSkillInfo(_team, _skill);

        teamSkillsCreationPromises.push(TeamsDataHandler.addTeamSkill(teamSkillInfo));
      });
    });

    return Promise.all(teamSkillsCreationPromises)
      .then((teamSkills: TeamSkill[]) => {
        testModels.teamSkills = teamSkills;
      });
  }

  private static _fillTeamSkillUpvotes(testModels: ITestModels): Promise<any> {
    var teamSkillUpvotesCreationPromises: Promise<TeamSkillUpvote>[] = [];

    testModels.teamSkills.forEach((_teamSkill: TeamSkill) => {
      testModels.users.forEach((_user: User) => {
        teamSkillUpvotesCreationPromises.push(TeamsDataHandler.upvoteTeamSkill(_teamSkill.id, _user.id));
      });
    });

    return Promise.all(teamSkillUpvotesCreationPromises)
      .then((teamSkillUpvotes: TeamSkillUpvote[]) => {
        testModels.teamSkillUpvotes = teamSkillUpvotes;
      });
  }

}
