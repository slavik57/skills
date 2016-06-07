import {ModelBase} from "./modelBase";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {Skill} from "./skill";
import {ISkillOfATeam} from "./interfaces/iSkillOfATeam";
import {IUserOfATeam} from "./interfaces/iUserOfATeam";
import {Model, Collection, EventFunction, CollectionOptions, CollectionFetchOptions} from 'bookshelf';
import {bookshelf} from '../../bookshelf';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {TypesValidator} from '../commonUtils/typesValidator';
import {User} from './user';
import {TeamMember} from './teamMember';
import {IHasPivot} from './interfaces/iHasPivot';
import {ITeamInfo} from './interfaces/iTeamInfo';
import {TeamSkill} from './teamSkill';

export class Team extends ModelBase<Team, ITeamInfo> implements IHasPivot<TeamMember> {
  public attributes: ITeamInfo;
  public pivot: TeamMember;

  public get tableName(): string { return 'teams'; }
  public get idAttribute(): string { return 'id'; }
  public static get nameAttribute(): string { return 'name'; }

  public static collection(teams?: Team[], options?: CollectionOptions<Team>): Collection<Team> {
    return new Teams(teams, options);
  }

  public initialize(): void {
    this.on('saving', (team: Team) => this.validateTeam(team));
  }

  public validateTeam(team: Team): Promise<boolean> {
    if (!TypesValidator.isLongEnoughString(team.attributes.name, 1)) {
      return Promise.reject('The team name must not be empty');
    }

    return Promise.resolve(true);
  }

  public teamSkills(): Collection<TeamSkill> {
    return this.hasMany(TeamSkill, TeamSkill.teamIdAttribute);
  }

  public getTeamMembers(): Promise<IUserOfATeam[]> {
    return this.belongsToMany(User)
      .withPivot([TeamMember.isAdminAttribute])
      .through<User>(TeamMember, TeamMember.teamIdAttribute, TeamMember.userIdAttribute)
      .fetch()
      .then((usersCollection: Collection<User>) => {
        var users: User[] = usersCollection.toArray();

        return _.map(users, _user => this._convertUserToUserOfATeam(_user));
      });
  }

  public getTeamSkills(): Promise<ISkillOfATeam[]> {
    var fetchOptions: CollectionFetchOptions = {
      withRelated: [
        TeamSkill.relatedTeamSkillUpvotesAttribute,
        TeamSkill.relatedSkillAttribute
      ]
    };

    return this.teamSkills()
      .fetch(fetchOptions)
      .then((teamSkillsCollection: Collection<TeamSkill>) => {
        var teamSkills: TeamSkill[] = teamSkillsCollection.toArray();

        return _.map(teamSkills, _skill => this._convertTeamSkillToSkillOfATeam(_skill));
      })
  }

  private _convertUserToUserOfATeam(user: User): IUserOfATeam {
    return {
      user: user,
      isAdmin: user.pivot.attributes.is_admin
    }
  }

  private _convertTeamSkillToSkillOfATeam(teamSkill: TeamSkill): ISkillOfATeam {
    var skill: Skill = teamSkill.relations.skill;

    var upvotesCollection: Collection<TeamSkillUpvote> = teamSkill.relations.upvotes;
    var upvotes: TeamSkillUpvote[] = upvotesCollection.toArray();

    var upvotingIds =
      _.map(upvotes, _ => _.attributes.user_id);

    return {
      skill: skill,
      upvotingUserIds: upvotingIds
    };
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
