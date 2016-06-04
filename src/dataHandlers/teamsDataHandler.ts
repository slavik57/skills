import {Collection} from 'bookshelf';
import {ITeamInfo, Team} from '../models/team';
import {} from '../models/user';
import {ITeamMemberInfo, TeamMember} from '../models/teamMember';
import {User} from '../models/user';

export class TeamsDataHandler {

  public static createTeam(teamInfo: ITeamInfo): Promise<Team> {
    return new Team(teamInfo).save();
  }

  public static addTeamMember(teamMemberInfo: ITeamMemberInfo): Promise<TeamMember> {
    return new TeamMember(teamMemberInfo).save();
  }

  public static getTeamMembers(teamName: string): Promise<User[]> {
    return this.getTeam(teamName)
      .then((team: Team) => team.getTeamMembers().fetch())
      .then((teamMembers: Collection<User>) => teamMembers.toArray());
  }

  private static getTeam(teamName: string): Promise<Team> {
    return new Team()
      .query({ where: { name: teamName } })
      .fetch();
  }

}
