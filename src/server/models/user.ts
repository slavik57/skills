import {TeamCreator} from "./teamCreator";
import {SkillCreator} from "./skillCreator";
import {TeamSkillUpvote} from "./teamSkillUpvote";
import {IUserRelations} from "./interfaces/iUserRelations";
import {ModelBase} from "./modelBase";
import {IHasPivot} from "./interfaces/iHasPivot";
import {Model, Collection, EventFunction, CollectionOptions} from 'bookshelf';
import {bookshelf} from '../../../bookshelf';
import * as Promise from 'bluebird';
import * as validator from 'validator';
import * as _ from 'lodash';
import {TypesValidator} from '../../common/typesValidator';
import {UserGlobalPermissions} from './usersGlobalPermissions';
import {Team} from './team';
import {TeamMember} from './teamMember';
import {ITeamOfAUser} from './interfaces/iTeamOfAUser';
import {IUserInfo} from './interfaces/iUserInfo';

export class User extends ModelBase<User, IUserInfo> implements IHasPivot<TeamMember> {
  public get tableName(): string { return 'users'; }
  public static get dependents(): string[] {
    return [
      User.relatedUserGlobalPermissionsAttribute,
      User.relatedTeamMembersAttribute,
      User.relatedTeamSkillUpvotesAttribute,
      User.relatedSkillsCreatorAttribute,
      User.relatedTeamsCreatorAttribute
    ];
  }

  public pivot: TeamMember;
  public relations: IUserRelations;

  public static get usernameAttribute(): string { return 'username'; }
  public static get emailAttribute(): string { return 'email'; }
  public static get firstNameAttribute(): string { return 'firstName'; }
  public static get lastNameAttribute(): string { return 'lastName'; }
  public static get relatedUserGlobalPermissionsAttribute(): string { return 'globalPermissions'; }
  public static get relatedTeamMembersAttribute(): string { return 'teamMembers'; }
  public static get relatedTeamSkillUpvotesAttribute(): string { return 'teamSkillUpvotes'; }
  public static get relatedSkillsCreatorAttribute(): string { return 'skillsCreator'; }
  public static get relatedTeamsCreatorAttribute(): string { return 'teamsCreator'; }

  public static collection(users?: User[], options?: CollectionOptions<User>): Collection<User> {
    return new Users(users, options);
  }

  public initialize(): void {
    this.on('saving', (user: User) => this._validateUser(user));
  }

  private _validateUser(user: User): Promise<boolean> {
    if (!TypesValidator.isNullOrUndefined(this.attributes.email) &&
      !validator.isEmail(this.attributes.email)) {
      return Promise.reject('Email is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.username, 1)) {
      return Promise.reject('Username is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.password_hash, 1)) {
      return Promise.reject('Password is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.firstName, 1)) {
      return Promise.reject('First name is not valid');
    }

    if (!TypesValidator.isLongEnoughString(this.attributes.lastName, 1)) {
      return Promise.reject('Last name is not valid');
    }

    return Promise.resolve(true);
  }

  public globalPermissions(): Collection<UserGlobalPermissions> {
    return this.hasMany(UserGlobalPermissions, UserGlobalPermissions.userIdAttribute);
  }

  public teamMembers(): Collection<TeamMember> {
    return this.hasMany(TeamMember, TeamMember.userIdAttribute);
  }

  public teamSkillUpvotes(): Collection<TeamSkillUpvote> {
    return this.hasMany(TeamSkillUpvote, TeamSkillUpvote.userIdAttribute);
  }

  public skillsCreator(): Collection<SkillCreator> {
    return this.hasMany(SkillCreator, SkillCreator.userIdAttribute);
  }

  public teamsCreator(): Collection<TeamCreator> {
    return this.hasMany(TeamCreator, TeamCreator.userIdAttribute);
  }

  public getTeams(): Promise<ITeamOfAUser[]> {
    return this.belongsToMany(Team)
      .withPivot([TeamMember.isAdminAttribute])
      .through<Team>(TeamMember, TeamMember.userIdAttribute, TeamMember.teamIdAttribute)
      .fetch()
      .then((teamsCollection: Collection<Team>) => {
        var teams: Team[] = teamsCollection.toArray();

        return _.map(teams, _team => this._convertTeamToTeamOfAUser(_team));
      });
  }

  private _convertTeamToTeamOfAUser(team: Team): ITeamOfAUser {
    var teamMember: TeamMember = <TeamMember>team.pivot;

    var isAdmin: boolean = teamMember.attributes.is_admin;

    return {
      team: team,
      isAdmin: isAdmin
    }
  }
}

export class Users extends bookshelf.Collection<User> {
  model = User;

  public static clearAll(): Promise<any> {
    return new Users().query().del();
  }
}
