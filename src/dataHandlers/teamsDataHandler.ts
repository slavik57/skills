import {TeamSkillUpvote} from "../models/teamSkillUpvote";
import {ITeamSkillUpvoteInfo} from "../models/interfaces/iTeamSkillUpvoteInfo";
import {ISkillOfATeam} from "../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {Collection, SaveOptions, DestroyOptions, CollectionFetchOptions } from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import {Team} from '../models/team';
import {} from '../models/user';
import {TeamMember} from '../models/teamMember';
import {User, Users} from '../models/user';
import {TeamSkill, TeamSkills} from '../models/teamSkill';

export class TeamsDataHandler {

  public static createTeam(teamInfo: ITeamInfo): Promise<Team> {
    return new Team(teamInfo).save();
  }

  public static addTeamMember(teamMemberInfo: ITeamMemberInfo): Promise<TeamMember> {
    return new TeamMember(teamMemberInfo).save();
  }

  public static addTeamSkill(teamSkillInfo: ITeamSkillInfo): Promise<TeamSkill> {
    return new TeamSkill(teamSkillInfo).save();
  }

  public static getTeamMembers(teamId: number): Promise<IUserOfATeam[]> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.getTeamMembers();
  }

  public static getTeamSkills(teamId: number): Promise<ISkillOfATeam[]> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.getTeamSkills();
  }

  public static getTeam(teamId: number): Promise<Team> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.fetch();
  }

  public static upvoteTeamSkill(teamSkillId: number, upvotingUserId: number): Promise<TeamSkillUpvote> {
    var upvoteInfo: ITeamSkillUpvoteInfo = {
      team_skill_id: teamSkillId,
      user_id: upvotingUserId
    };

    return new TeamSkillUpvote(upvoteInfo).save();
  }

  public static removeUpvoteForTeamSkill(teamSkillId: number, upvotedUserId: number): Promise<TeamSkillUpvote> {
    var idQuery = {};
    idQuery[TeamSkillUpvote.teamSkillIdAttribute] = teamSkillId;
    idQuery[TeamSkillUpvote.userIdAttribute] = upvotedUserId;

    var destroyOptions: DestroyOptions = {
      require: true
    }

    return new TeamSkillUpvote()
      .where(idQuery)
      .destroy(destroyOptions);
  }

  public static setAdminRights(teamId: number, userId: number, newAdminRights: boolean): Promise<TeamMember> {
    return bookshelf.transaction(() => {
      return this._setAdminRightsInternal(teamId, userId, newAdminRights);
    });
  }

  private static _initializeTeamByIdQuery(teamId: number): Team {
    var queryCondition = {};
    queryCondition[Team.idAttribute] = teamId;

    return new Team(queryCondition);
  }

  private static _setAdminRightsInternal(teamId: number, userId: number, newAdminRights: boolean): Promise<TeamMember> {
    var queryCondition = {};
    queryCondition[TeamMember.teamIdAttribute] = teamId;
    queryCondition[TeamMember.userIdAttribute] = userId;

    var updateAttributes = {};
    updateAttributes[TeamMember.isAdminAttribute] = newAdminRights;

    var saveOptions: SaveOptions = {
      patch: true,
      method: 'update'
    }

    return new TeamMember(queryCondition)
      .fetch()
      .then((teamMember: TeamMember) => {
        return teamMember.save(updateAttributes, saveOptions);
      });
  }

}
