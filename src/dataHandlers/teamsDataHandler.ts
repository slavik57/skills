import {Teams} from "../models/team";
import {ISkillsOfATeam} from "../models/interfaces/iSkillsOfATeam";
import {IDestroyOptions} from "./interfaces/iDestroyOptions";
import {TeamSkillUpvote} from "../models/teamSkillUpvote";
import {ITeamSkillUpvoteInfo} from "../models/interfaces/iTeamSkillUpvoteInfo";
import {ISkillOfATeam} from "../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {Collection, SaveOptions, DestroyOptions, FetchOptions, CollectionFetchOptions } from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import {Team} from '../models/team';
import {} from '../models/user';
import {TeamMember} from '../models/teamMember';
import {User, Users} from '../models/user';
import {TeamSkill, TeamSkills} from '../models/teamSkill';
import {Transaction}from 'knex';

export class TeamsDataHandler {

  public static createTeam(teamInfo: ITeamInfo): Promise<Team> {
    return new Team(teamInfo).save();
  }

  public static deleteTeam(teamId: number): Promise<Team> {
    return this._initializeTeamByIdQuery(teamId).destroy();
  }

  public static addTeamMember(teamMemberInfo: ITeamMemberInfo): Promise<TeamMember> {
    return new TeamMember(teamMemberInfo).save();
  }

  public static removeTeamMember(teamId: number, userId: number): Promise<TeamMember> {
    var query = {}
    query[TeamMember.teamIdAttribute] = teamId;
    query[TeamMember.userIdAttribute] = userId;

    var destroyOptions: IDestroyOptions = {
      require: false,
      cascadeDelete: false
    };

    return new TeamMember().where(query).destroy(destroyOptions);
  }

  public static addTeamSkill(teamSkillInfo: ITeamSkillInfo): Promise<TeamSkill> {
    return new TeamSkill(teamSkillInfo).save();
  }

  public static removeTeamSkill(teamId: number, skillId: number): Promise<TeamSkill> {
    var query = {};
    query[TeamSkill.teamIdAttribute] = teamId;
    query[TeamSkill.skillIdAttribute] = skillId;

    /* TODO: when the issue: https://github.com/seegno/bookshelf-cascade-delete/issues/14
            is fixed just use this line without the need for fetching:
            new TeamSkill().where(query).destroy();
    */
    return new TeamSkill().where(query).fetch()
      .then((_teamSkill: TeamSkill) => {
        if (!_teamSkill) {
          return Promise.resolve(null);
        }

        return _teamSkill.destroy();
      });
  }

  public static getTeamMembers(teamId: number): Promise<IUserOfATeam[]> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.getTeamMembers();
  }

  public static getTeamSkills(teamId: number): Promise<ISkillOfATeam[]> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.getTeamSkills();
  }

  public static getSkillsOfTeams(): Promise<ISkillsOfATeam[]> {
    return Teams.getSkillsOfTeams();
  }

  public static getTeam(teamId: number): Promise<Team> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.fetch();
  }

  public static getTeams(): Promise<Team[]> {
    return new Teams().fetch()
      .then((_teamsCollection: Collection<Team>) => {
        return _teamsCollection.toArray();
      });
  }

  public static upvoteTeamSkill(teamSkillId: number, upvotingUserId: number): Promise<TeamSkillUpvote> {
    var upvoteInfo: ITeamSkillUpvoteInfo = {
      team_skill_id: teamSkillId,
      user_id: upvotingUserId
    };

    return new TeamSkillUpvote(upvoteInfo).save();
  }

  public static removeUpvoteForTeamSkill(teamSkillId: number, upvotedUserId: number): Promise<TeamSkillUpvote> {
    var query = {};
    query[TeamSkillUpvote.teamSkillIdAttribute] = teamSkillId;
    query[TeamSkillUpvote.userIdAttribute] = upvotedUserId;

    var destroyOptions: IDestroyOptions = {
      require: true,
      cascadeDelete: false
    }

    return new TeamSkillUpvote()
      .where(query).destroy(destroyOptions);
  }

  public static setAdminRights(teamId: number, userId: number, newAdminRights: boolean): Promise<TeamMember> {
    return bookshelf.transaction((_transaction: Transaction) => {
      return this._setAdminRightsInternal(teamId, userId, newAdminRights, _transaction);
    });
  }

  private static _initializeTeamByIdQuery(teamId: number): Team {
    var queryCondition = {};
    queryCondition[Team.idAttribute] = teamId;

    return new Team(queryCondition);
  }

  private static _setAdminRightsInternal(teamId: number, userId: number, newAdminRights: boolean, transaction: Transaction): Promise<TeamMember> {
    var queryCondition = {};
    queryCondition[TeamMember.teamIdAttribute] = teamId;
    queryCondition[TeamMember.userIdAttribute] = userId;

    var updateAttributes = {};
    updateAttributes[TeamMember.isAdminAttribute] = newAdminRights;

    var saveOptions: SaveOptions = {
      patch: true,
      method: 'update',
      transacting: transaction
    }

    var fetchOptions: FetchOptions = {
      transacting: transaction
    }

    return new TeamMember(queryCondition)
      .fetch(fetchOptions)
      .then((teamMember: TeamMember) => {
        return teamMember.save(updateAttributes, saveOptions);
      });
  }

}
