import {TeamCreator} from "./teamCreator";
import {ITeamRelations} from "./interfaces/iTeamRelations";
import {ISkillsOfATeam} from "./interfaces/iSkillsOfATeam";
import {ModelBase} from "./modelBase";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {Skill} from "./skill";
import {ISkillOfATeam} from "./interfaces/iSkillOfATeam";
import {IUserOfATeam} from "./interfaces/iUserOfATeam";
import {Model, Collection, EventFunction, CollectionOptions, CollectionFetchOptions} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import * as _ from 'lodash';
import {TypesValidator} from '../../common/typesValidator';
import {User} from './user';
import {TeamMember} from './teamMember';
import {IHasPivot} from './interfaces/iHasPivot';
import {ITeamInfo} from './interfaces/iTeamInfo';
import {TeamSkill} from './teamSkill';
import * as bluebirdPromise from 'bluebird';

export class Team extends ModelBase<Team, ITeamInfo> implements IHasPivot<TeamMember> {
  public get tableName(): string { return 'teams'; }
  public static get dependents(): string[] {
    return [
      Team.relatedTeamMembersAttribute,
      Team.relatedTeamSkillsAttribute,
      Team.relatedTeamCreatorAttribute
    ];
  }

  public relations: ITeamRelations;
  public pivot: TeamMember;

  public static get nameAttribute(): string { return 'name'; }
  public static get relatedTeamMembersAttribute(): string { return 'teamMembers'; }
  public static get relatedTeamSkillsAttribute(): string { return 'teamSkills'; }
  public static get relatedTeamCreatorAttribute(): string { return 'teamCreator'; }

  public static collection(teams?: Team[], options?: CollectionOptions<Team>): Collection<Team> {
    return new Teams(teams, options);
  }

  public initialize(): void {
    this.on('saving', (team: Team) => this.validateTeam(team));
  }

  public validateTeam(team: Team): bluebirdPromise<boolean> {
    if (!TypesValidator.isLongEnoughString(team.attributes.name, 1)) {
      var error = new Error();
      error.message = 'The team name must not be empty';
      return bluebirdPromise.reject(error);
    }

    return bluebirdPromise.resolve(true);
  }

  public teamMembers(): Collection<TeamMember> {
    return this.hasMany(TeamMember, TeamMember.teamIdAttribute);
  }

  public teamSkills(): Collection<TeamSkill> {
    return this.hasMany(TeamSkill, TeamSkill.teamIdAttribute);
  }

  public teamCreator(): TeamCreator {
    return this.hasOne(TeamCreator, TeamCreator.teamIdAttribute);
  }

  public getTeamMembers(): bluebirdPromise<IUserOfATeam[]> {
    return this.belongsToMany(User)
      .withPivot([TeamMember.isAdminAttribute])
      .through<User>(TeamMember, TeamMember.teamIdAttribute, TeamMember.userIdAttribute)
      .fetch()
      .then((usersCollection: Collection<User>) => {
        var users: User[] = usersCollection.toArray();

        return _.map(users, _user => this._convertUserToUserOfATeam(_user));
      });
  }

  public getTeamSkills(): bluebirdPromise<ISkillOfATeam[]> {
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

        return _.map(teamSkills, _skill => Team.convertTeamSkillToSkillOfATeam(_skill));
      })
  }

  public static convertTeamSkillToSkillOfATeam(teamSkill: TeamSkill): ISkillOfATeam {
    var skill: Skill = teamSkill.relations.skill;

    var upvotesCollection: Collection<TeamSkillUpvote> = teamSkill.relations.upvotes;
    var upvotes: TeamSkillUpvote[] = upvotesCollection.toArray();

    var upvotingIds =
      _.map(upvotes, _ => _.attributes.user_id);

    return {
      skill: skill,
      teamSkill: teamSkill,
      upvotingUserIds: upvotingIds
    };
  }

  private _convertUserToUserOfATeam(user: User): IUserOfATeam {
    return {
      user: user,
      isAdmin: user.pivot.attributes.is_admin
    }
  }

}

export class Teams extends bookshelf.Collection<Team> {
  model = Team;

  public static clearAll(): bluebirdPromise<any> {
    return new Teams().query().del();
  }

  public static getSkillsOfTeams(): bluebirdPromise<ISkillsOfATeam[]> {
    var fetchOptions: CollectionFetchOptions = {
      withRelated: [
        Team.relatedTeamSkillsAttribute,
        Team.relatedTeamSkillsAttribute + '.' + TeamSkill.relatedTeamSkillUpvotesAttribute,
        Team.relatedTeamSkillsAttribute + '.' + TeamSkill.relatedSkillAttribute
      ]
    };

    return new Teams()
      .fetch(fetchOptions)
      .then((_teamsCollection: Collection<Team>) => {
        return _teamsCollection.toArray();
      })
      .then((_teams: Team[]) => {
        return _.map(_teams, _team => this._convertToSkillsOfATeam(_team));
      });
  }

  private static _convertToSkillsOfATeam(team: Team): ISkillsOfATeam {
    var teamSkills: TeamSkill[] = team.relations.teamSkills.toArray();

    var skillsOfATeam: ISkillOfATeam[] =
      _.map(teamSkills, _teamSkill => Team.convertTeamSkillToSkillOfATeam(_teamSkill));

    return {
      team: team,
      skills: skillsOfATeam
    }
  }

}
