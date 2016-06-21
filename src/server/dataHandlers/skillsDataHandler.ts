import {IPrerequisitesOfASkill} from "../models/interfaces/iPrerequisitesOfASkill";
import {TeamSkills} from "../models/teamSkill";
import {ITeamsOfASkill} from "../models/interfaces/iTeamsOfASkill";
import {IDestroyOptions} from "./interfaces/iDestroyOptions";
import {ITeamOfASkill} from "../models/interfaces/iTeamOfASkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {Collection, FetchOptions, CollectionFetchOptions} from 'bookshelf';
import {Skill, Skills} from '../models/skill';
import {SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';
import * as bluebirdPromise from 'bluebird';

export class SkillsDataHandler {
  public static createSkill(skillInfo: ISkillInfo): bluebirdPromise<Skill> {
    return new Skill(skillInfo).save();
  }

  public static deleteSkill(skillId: number): bluebirdPromise<Skill> {
    return this._initializeSkillByIdQuery(skillId).destroy();
  }

  public static getSkills(): bluebirdPromise<Skill[]> {
    return new Skills().fetch()
      .then((skills: Collection<Skill>) => {
        return skills.toArray();
      });
  }

  public static addSkillPrerequisite(skillPrerequisiteInfo: ISkillPrerequisiteInfo): bluebirdPromise<SkillPrerequisite> {
    return new SkillPrerequisite(skillPrerequisiteInfo).save();
  }

  public static removeSkillPrerequisite(skillId: number, skillPrerequisiteId: number): bluebirdPromise<SkillPrerequisite> {
    var query = {};
    query[SkillPrerequisite.skillIdAttribute] = skillId;
    query[SkillPrerequisite.skillPrerequisiteIdAttribute] = skillPrerequisiteId;

    var destroyOptions: IDestroyOptions = {
      cascadeDelete: false
    };

    return new SkillPrerequisite().where(query).destroy(destroyOptions);
  }

  public static getSkillsPrerequisites(): bluebirdPromise<SkillPrerequisite[]> {
    return new SkillPrerequisites().fetch()
      .then((skillPrerequisites: Collection<SkillPrerequisite>) => {
        return skillPrerequisites.toArray();
      });
  }

  public static getSkillPrerequisites(skillId: number): bluebirdPromise<Skill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchSkillPrerequisitesBySkill(skill)
      .then((skills: Collection<Skill>) => skills.toArray());
  }

  public static getSkillContributions(skillId: number): bluebirdPromise<Skill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchContributingSkillsBySkill(skill)
      .then((skills: Collection<Skill>) => skills.toArray());
  }

  public static getSkillsToPrerequisitesMap(): bluebirdPromise<IPrerequisitesOfASkill[]> {
    return Skills.getSkillsToPrerequisitesMap();
  }

  public static getSkill(skillId: number): bluebirdPromise<Skill> {
    var fetchOptions: FetchOptions = {
      require: false
    }

    return this._initializeSkillByIdQuery(skillId)
      .fetch(fetchOptions);
  }

  public static getTeams(skillId: number): bluebirdPromise<ITeamOfASkill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchSkillTeams(skill);
  }

  public static getTeamsOfSkills(): bluebirdPromise<ITeamsOfASkill[]> {
    return Skills.getTeamsOfSkills();
  }

  private static _initializeSkillByIdQuery(skillId: number): Skill {
    var queryCondition = {};
    queryCondition[Skill.idAttribute] = skillId;

    return new Skill(queryCondition);
  }

  private static _initializeSkillPrerequisiteByIdQuery(skillPrerequisiteId: number): SkillPrerequisite {
    var queryCondition = {};
    queryCondition[SkillPrerequisite.idAttribute] = skillPrerequisiteId;

    return new SkillPrerequisite(queryCondition);
  }

  private static _fetchSkillPrerequisitesBySkill(skill: Skill): bluebirdPromise<Collection<Skill>> {
    var fetchOptions: CollectionFetchOptions = {
      require: false
    }

    return skill.prerequisiteSkills().fetch(fetchOptions);
  }

  private static _fetchContributingSkillsBySkill(skill: Skill): bluebirdPromise<Collection<Skill>> {
    var fetchOptions: CollectionFetchOptions = {
      require: false
    }

    return skill.contributingSkills().fetch(fetchOptions);
  }

  private static _fetchSkillTeams(skill: Skill): bluebirdPromise<ITeamOfASkill[]> {
    return skill.getTeams();
  }
}
