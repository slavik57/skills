import {TeamCreator, TeamCreators} from "../models/teamCreator";
import {ITeamCreatorInfo} from "../models/interfaces/iTeamCreatorInfo";
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
import {bookshelf} from '../../../bookshelf';
import {Team} from '../models/team';
import {} from '../models/user';
import {TeamMember} from '../models/teamMember';
import {User, Users} from '../models/user';
import {TeamSkill, TeamSkills} from '../models/teamSkill';
import {Transaction}from 'knex';
import * as bluebirdPromise from 'bluebird';

export class TeamsDataHandler {

  public static createTeam(teamInfo: ITeamInfo, creatorId: number): bluebirdPromise<Team> {
    return bookshelf.transaction((_transaction: Transaction) => {
      var saveOptions: SaveOptions = {
        transacting: _transaction
      }

      var team: Team;
      var teamCreatorInfo: ITeamCreatorInfo;
      return new Team(teamInfo).save(null, saveOptions)
        .then((_team: Team) => {
          team = _team;

          teamCreatorInfo = {
            user_id: creatorId,
            team_id: team.id
          };
        })
        .then(() => new TeamCreator(teamCreatorInfo).save(null, saveOptions))
        .then(() => {
          return team;
        });
    });
  }

  public static deleteTeam(teamId: number): bluebirdPromise<Team> {
    return this._initializeTeamByIdQuery(teamId).destroy();
  }

  public static addTeamMember(teamMemberInfo: ITeamMemberInfo): bluebirdPromise<TeamMember> {
    return new TeamMember(teamMemberInfo).save();
  }

  public static removeTeamMember(teamId: number, userId: number): bluebirdPromise<TeamMember> {
    var query = {}
    query[TeamMember.teamIdAttribute] = teamId;
    query[TeamMember.userIdAttribute] = userId;

    var destroyOptions: IDestroyOptions = {
      require: false,
      cascadeDelete: false
    };

    return new TeamMember().where(query).destroy(destroyOptions);
  }

  public static addTeamSkill(teamSkillInfo: ITeamSkillInfo): bluebirdPromise<TeamSkill> {
    return new TeamSkill(teamSkillInfo).save();
  }

  public static removeTeamSkill(teamId: number, skillId: number): bluebirdPromise<TeamSkill> {
    var query = {};
    query[TeamSkill.teamIdAttribute] = teamId;
    query[TeamSkill.skillIdAttribute] = skillId;

    return new TeamSkill().where(query).destroy();
  }

  public static getTeamMembers(teamId: number): bluebirdPromise<IUserOfATeam[]> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.getTeamMembers();
  }

  public static getTeamSkills(teamId: number): bluebirdPromise<ISkillOfATeam[]> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.getTeamSkills();
  }

  public static getSkillsOfTeams(): bluebirdPromise<ISkillsOfATeam[]> {
    return Teams.getSkillsOfTeams();
  }

  public static getTeam(teamId: number): bluebirdPromise<Team> {
    var team: Team = this._initializeTeamByIdQuery(teamId);

    return team.fetch();
  }

  public static getTeams(): bluebirdPromise<Team[]> {
    return new Teams().fetch()
      .then((_teamsCollection: Collection<Team>) => {
        return _teamsCollection.toArray();
      });
  }

  public static getNumberOfTeams(): bluebirdPromise<number> {
    return new Teams().count()
      .then((_numberOfTeams: any) => {
        return Number(_numberOfTeams);
      });
  }

  public static upvoteTeamSkill(teamSkillId: number, upvotingUserId: number): bluebirdPromise<TeamSkillUpvote> {
    var upvoteInfo: ITeamSkillUpvoteInfo = {
      team_skill_id: teamSkillId,
      user_id: upvotingUserId
    };

    return new TeamSkillUpvote(upvoteInfo).save();
  }

  public static removeUpvoteForTeamSkill(teamSkillId: number, upvotedUserId: number): bluebirdPromise<TeamSkillUpvote> {
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

  public static setAdminRights(teamId: number, userId: number, newAdminRights: boolean): bluebirdPromise<TeamMember> {
    return bookshelf.transaction((_transaction: Transaction) => {
      return this._setAdminRightsInternal(teamId, userId, newAdminRights, _transaction);
    });
  }

  public static getTeamsCreators(): bluebirdPromise<TeamCreator[]> {
    return new TeamCreators().fetch()
      .then((_teamsCreatorsCollection: Collection<TeamCreator>) => {
        return _teamsCreatorsCollection.toArray();
      });
  }

  private static _initializeTeamByIdQuery(teamId: number): Team {
    var queryCondition = {};
    queryCondition[Team.idAttribute] = teamId;

    return new Team(queryCondition);
  }

  private static _setAdminRightsInternal(teamId: number, userId: number, newAdminRights: boolean, transaction: Transaction): bluebirdPromise<TeamMember> {
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
