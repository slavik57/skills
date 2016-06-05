import {Skill} from "./skill";
import {ISkillOfATeam} from "./interfaces/iSkillOfATeam";
import {IUserOfATeam} from "./interfaces/iUserOfATeam";
import {Model, Collection, EventFunction} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {TypesValidator} from '../commonUtils/typesValidator';
import {User} from './user';
import {TeamMember} from './teamMember';
import {ITeamMemberPivot} from './interfaces/iTeamMemberPivot';
import {ITeamInfo} from './interfaces/iTeamInfo';
import {TeamSkill} from './teamSkill';

export class Team extends bookshelf.Model<Team> implements ITeamMemberPivot {
  public attributes: ITeamInfo;
  public pivot: TeamMember;

  public get tableName() { return 'teams'; }
  public get idAttribute() { return 'id'; }

  public initialize(): void {
    this.on('saving', (team: Team) => this.validateTeam(team));
  }

  public validateTeam(team: Team): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(team.attributes.name, 1)) {
      return Promise.reject('The team name must not be empty');
    }

    return null;
  }

  public getTeamMembers(): Promise<IUserOfATeam[]> {
    return this.belongsToMany(User)
      .withPivot(['is_admin'])
      .through<User>(TeamMember, 'team_id', 'user_id')
      .fetch()
      .then((usersCollection: Collection<User>) => {
        var users: User[] = usersCollection.toArray();

        return _.map(users, _user => this._convertUserToUserOfATeam(_user));
      });
  }

  public getTeamSkills(): Promise<ISkillOfATeam[]> {
    return this.belongsToMany(Skill)
      .withPivot(['upvotes'])
      .through<Skill>(TeamSkill, 'team_id', 'skill_id')
      .fetch()
      .then((skillsCollection: Collection<Skill>) => {
        var skills: Skill[] = skillsCollection.toArray();

        return _.map(skills, _skill => this._convertSkillToSkillOfATeam(_skill));
      });
  }

  private _convertUserToUserOfATeam(user: User): IUserOfATeam {
    return {
      user: user,
      isAdmin: user.pivot.attributes.is_admin
    }
  }

  private _convertSkillToSkillOfATeam(skill: Skill): ISkillOfATeam {
    return {
      skill: skill,
      upvotes: skill.pivot.attributes.upvotes
    }
  }

}

export class Teams extends bookshelf.Collection<Team> {
  model = Team;

  public static clearAll(): Promise<any> {
    var promises: Promise<Team>[] = []

    return new Teams().fetch().then((teams: Collection<Team>) => {
      teams.each(team => {
        var promise: Promise<Team> = team.destroy(null);
        promises.push(promise);
      });

      return Promise.all(promises);
    });
  }
}
