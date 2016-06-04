import {Collection} from 'bookshelf';
import {ITeamInfo, Team} from '../models/team';
import {} from '../models/user';
import {ITeamMemberInfo, TeamMember} from '../models/teamMember';
import {User, Users} from '../models/user';

export class TeamsDataHandler {

  public static createTeam(teamInfo: ITeamInfo): Promise<Team> {
    return new Team(teamInfo).save();
  }

  public static addTeamMember(teamMemberInfo: ITeamMemberInfo): Promise<TeamMember> {
    return new TeamMember(teamMemberInfo).save();
  }

  public static getTeamMembers(teamName: string): Promise<User[]> {
    return this.getTeam(teamName)
      .then((team: Team) => this.fetchTeamMembersOfTeam(team))
      .then((teamMembers: Collection<User>) => teamMembers.toArray());
  }

  public static getTeam(teamName: string): Promise<Team> {
    return new Team()
      .query({ where: { name: teamName } })
      .fetch();
  }

  private static fetchTeamMembersOfTeam(team: Team): Promise<Collection<User>> {
    if (!team) {
      return Promise.resolve(new Users());
    }

    return team.getTeamMembers().fetch();
  }

}
