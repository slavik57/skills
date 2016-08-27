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
import * as bluebirdPromise from 'bluebird';

export class EnvironmentDirtifier {
  private static get numberOfUsers(): number { return 5; }
  private static get permissionsForEachUser(): GlobalPermission[] {
    return [
      GlobalPermission.ADMIN,
      GlobalPermission.TEAMS_LIST_ADMIN,
      GlobalPermission.SKILLS_LIST_ADMIN,
      GlobalPermission.READER
    ];
  }

  public static fillAllTables(): bluebirdPromise<ITestModels> {
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
      .then(() => this._fillLevel3Tables(testModels))
      .then(() => testModels);
  }

  public static createUsers(numberOfUsers: number, suffix: string = ''): bluebirdPromise<User[]> {
    var userCreationPromises: bluebirdPromise<User>[] = [];
    for (var i = 0; i < numberOfUsers; i++) {
      var userInfo: IUserInfo = ModelInfoMockFactory.createUserInfo(i, suffix);

      userCreationPromises.push(UserDataHandler.createUser(userInfo));
    }

    return bluebirdPromise.all(userCreationPromises);
  }

  public static createSkills(numberOfSkills: number, creatorId: number, suffix: string = ''): bluebirdPromise<Skill[]> {
    var skillCreationPromises: bluebirdPromise<Skill>[] = [];
    for (var i = 0; i < numberOfSkills; i++) {
      var skillName: string = 'skill' + i.toString() + ' created by ' + creatorId.toString() + suffix;

      var skillInfo: ISkillInfo = ModelInfoMockFactory.createSkillInfo(skillName);

      skillCreationPromises.push(SkillsDataHandler.createSkill(skillInfo, creatorId));
    }

    return bluebirdPromise.all(skillCreationPromises);
  }

  public static createSkillPrerequisites(skills: Skill[]): bluebirdPromise<SkillPrerequisite[]> {
    var skillPrerequisitesCreationPromises: bluebirdPromise<SkillPrerequisite>[] = [];

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

    return bluebirdPromise.all(skillPrerequisitesCreationPromises);
  }

  public static createTeams(numberOfTeams: number, creatorId: number): bluebirdPromise<Team[]> {
    var teamCreationPromises: bluebirdPromise<Team>[] = [];
    for (var i = 0; i < numberOfTeams; i++) {
      var teamName: string = i.toString() + ' created by ' + creatorId.toString();

      var teamInfo: ITeamInfo = ModelInfoMockFactory.createTeamInfo(teamName);

      teamCreationPromises.push(TeamsDataHandler.createTeam(teamInfo, creatorId));
    }

    return bluebirdPromise.all(teamCreationPromises);
  }

  private static _fillLevel0Tables(testModels: ITestModels): bluebirdPromise<any> {
    return bluebirdPromise.all([
      this._fillUsers(testModels)
    ]);
  }

  private static _fillLevel1Tables(testModels: ITestModels): bluebirdPromise<any> {
    return bluebirdPromise.all([
      this._fillSkills(testModels),
      this._fillTeams(testModels),
      this._fillUsersGlobalPermissions(testModels),
    ]);
  }

  private static _fillLevel2Tables(testModels: ITestModels): bluebirdPromise<any> {
    return bluebirdPromise.all([
      this._fillTeamMembers(testModels),
      this._fillSkillPrerequisites(testModels),
      this._fillTeamSkills(testModels)
    ]);
  }

  private static _fillLevel3Tables(testModels: ITestModels): bluebirdPromise<any> {
    return this._fillTeamSkillUpvotes(testModels);
  }

  private static _fillUsers(testModels: ITestModels): bluebirdPromise<any> {
    return this.createUsers(this.numberOfUsers)
      .then((users: User[]) => {
        testModels.users = users;
      });
  }

  private static _fillTeams(testModels: ITestModels): bluebirdPromise<any> {
    var teamsPromises: bluebirdPromise<Team[]>[] = [];

    testModels.users.forEach((_user: User) => {
      var teamsPromise: bluebirdPromise<Team[]> =
        this.createTeams(1, _user.id);

      teamsPromises.push(teamsPromise);
    });

    return bluebirdPromise.all(teamsPromises)
      .then((_teams: Team[][]) => {
        testModels.teams = _.flatten(_teams);
      });
  }

  private static _fillSkills(testModels: ITestModels): bluebirdPromise<any> {
    var skillsPromises: bluebirdPromise<Skill[]>[] = [];

    testModels.users.forEach((_user: User) => {
      var skillsPromise: bluebirdPromise<Skill[]> =
        this.createSkills(1, _user.id);

      skillsPromises.push(skillsPromise);
    });

    return bluebirdPromise.all(skillsPromises)
      .then((_skills: Skill[][]) => {
        testModels.skills = _.flatten(_skills);
      });
  }

  private static _fillUsersGlobalPermissions(testModels: ITestModels): bluebirdPromise<any> {
    var permissionsCreationPromises: bluebirdPromise<UserGlobalPermissions[]>[] = [];

    testModels.users.forEach((_user: User) => {
      var permissionsPromise: bluebirdPromise<UserGlobalPermissions[]> =
        UserDataHandler.addGlobalPermissions(_user.id, this.permissionsForEachUser);

      permissionsCreationPromises.push(permissionsPromise);
    });

    return bluebirdPromise.all(permissionsCreationPromises)
      .then((permissions: UserGlobalPermissions[][]) => {
        testModels.userGlobalPermissions = _.flatten(permissions);
      });
  }

  private static _fillTeamMembers(testModels: ITestModels): bluebirdPromise<any> {
    var teamMembersCreationPromises: bluebirdPromise<TeamMember>[] = [];

    testModels.users.forEach((_user: User) => {
      testModels.teams.forEach((_team: Team) => {
        var teamMemberInfo: ITeamMemberInfo =
          ModelInfoMockFactory.createTeamMemberInfo(_team, _user);

        teamMembersCreationPromises.push(TeamsDataHandler.addTeamMember(teamMemberInfo));
      });
    });

    return bluebirdPromise.all(teamMembersCreationPromises)
      .then((teamMembers: TeamMember[]) => {
        testModels.teamMembers = teamMembers;
      });
  }

  private static _fillSkillPrerequisites(testModels: ITestModels): bluebirdPromise<any> {
    return this.createSkillPrerequisites(testModels.skills)
      .then((skillPrerequisites: SkillPrerequisite[]) => {
        testModels.skillPrerequisites = skillPrerequisites;
      });
  }

  private static _fillTeamSkills(testModels: ITestModels): bluebirdPromise<any> {
    var teamSkillsCreationPromises: bluebirdPromise<TeamSkill>[] = [];

    testModels.teams.forEach((_team: Team) => {
      testModels.skills.forEach((_skill: Skill) => {
        var teamSkillInfo: ITeamSkillInfo =
          ModelInfoMockFactory.createTeamSkillInfo(_team, _skill);

        teamSkillsCreationPromises.push(TeamsDataHandler.addTeamSkill(teamSkillInfo));
      });
    });

    return bluebirdPromise.all(teamSkillsCreationPromises)
      .then((teamSkills: TeamSkill[]) => {
        testModels.teamSkills = teamSkills;
      });
  }

  private static _fillTeamSkillUpvotes(testModels: ITestModels): bluebirdPromise<any> {
    var teamSkillUpvotesCreationPromises: bluebirdPromise<TeamSkillUpvote>[] = [];

    testModels.teamSkills.forEach((_teamSkill: TeamSkill) => {
      testModels.users.forEach((_user: User) => {
        teamSkillUpvotesCreationPromises.push(TeamsDataHandler.upvoteTeamSkill(_teamSkill.id, _user.id));
      });
    });

    return bluebirdPromise.all(teamSkillUpvotesCreationPromises)
      .then((teamSkillUpvotes: TeamSkillUpvote[]) => {
        testModels.teamSkillUpvotes = teamSkillUpvotes;
      });
  }

}
