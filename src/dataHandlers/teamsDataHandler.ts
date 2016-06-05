import {ISkillOfATeam} from "../models/interfaces/iSkillOfATeam";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {IUserOfATeam} from "../models/interfaces/iUserOfATeam";
import {ITeamMemberInfo} from "../models/interfaces/iTeamMemberInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {Collection} from 'bookshelf';
import {Team} from '../models/team';
import {} from '../models/user';
import {TeamMember} from '../models/teamMember';
import {User, Users} from '../models/user';
import {TeamSkill} from '../models/teamSkill';

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
      .then((team: Team) => this.fetchMembersOfTeam(team));
  }

  public static getTeamSkills(teamName: string): Promise<ISkillOfATeam[]> {
    return this.getTeam(teamName)
      .then((team: Team) => this.fetchSkillsOfTeam(team));
  }

  public static getTeam(teamName: string): Promise<Team> {
    return new Team()
      .query({ where: { name: teamName } })
      .fetch();
  }

  private static fetchMembersOfTeam(team: Team): Promise<IUserOfATeam[]> {
    if (!team) {
      return Promise.resolve([]);
    }

    return team.getTeamMembers();
  }

  private static fetchSkillsOfTeam(team: Team): Promise<ISkillOfATeam[]> {
    if (!team) {
      return Promise.resolve([]);
    }

    return team.getTeamSkills();
  }

}
