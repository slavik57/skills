import {ISkillOfATeam} from "../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {Collection, SaveOptions } from 'bookshelf';
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

  public static getTeamMembers(teamName: string): Promise<IUserOfATeam[]> {
    return this.getTeam(teamName)
      .then((team: Team) => this._fetchMembersOfTeam(team));
  }

  public static getTeamSkills(teamName: string): Promise<ISkillOfATeam[]> {
    return this.getTeam(teamName)
      .then((team: Team) => this._fetchSkillsOfTeam(team));
  }

  public static getTeam(teamName: string): Promise<Team> {
    var queryCondition = {};
    queryCondition[Team.nameAttribute] = teamName;

    return new Team()
      .query({ where: queryCondition })
      .fetch();
  }

  public static upvoteTeamSkill(teamId: number, skillId: number): Promise<TeamSkill> {
    return bookshelf.transaction((transaction) => {
      return this._upvodeTeamSkillInternal(teamId, skillId);
    });
  }

  private static _fetchMembersOfTeam(team: Team): Promise<IUserOfATeam[]> {
    if (!team) {
      return Promise.resolve([]);
    }

    return team.getTeamMembers();
  }

  private static _fetchSkillsOfTeam(team: Team): Promise<ISkillOfATeam[]> {
    if (!team) {
      return Promise.resolve([]);
    }

    return team.getTeamSkills();
  }

  private static _upvodeTeamSkillInternal(teamId: number, skillId: number): Promise<TeamSkill> {
    var queryCondition = {};
    queryCondition[TeamSkill.teamIdAttribute] = teamId;
    queryCondition[TeamSkill.skillIdAttribute] = skillId;

    return new TeamSkill(queryCondition)
      .fetch()
      .then((teamSkill: TeamSkill) => {
        var newUpvotes: number = teamSkill.attributes.upvotes + 1;

        return this._updateTeamSkillUpvotes(teamSkill, newUpvotes);
      });
  }

  private static _updateTeamSkillUpvotes(teamSkill: TeamSkill, newUpvotes: number): Promise<TeamSkill> {
    var updateAttributes = {};
    updateAttributes[TeamSkill.upvotesAttribute] = newUpvotes;

    var saveOptions: SaveOptions = {
      patch: true,
      method: 'update'
    }
    return teamSkill.save(updateAttributes, saveOptions);
  }

}
