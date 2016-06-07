import {ITeamOfASkill} from "../models/interfaces/iTeamOfASkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {Collection, FetchOptions, CollectionFetchOptions} from 'bookshelf';
import {Skill, Skills} from '../models/skill';
import {SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';

export class SkillsDataHandler {
  public static createSkill(skillInfo: ISkillInfo): Promise<Skill> {
    return new Skill(skillInfo).save();
  }

  public static getSkills(): Promise<Skill[]> {
    return new Skills().fetch()
      .then((skills: Collection<Skill>) => {
        return skills.toArray();
      });
  }

  public static addSkillPrerequisite(skillPrerequisiteInfo: ISkillPrerequisiteInfo): Promise<SkillPrerequisite> {
    return new SkillPrerequisite(skillPrerequisiteInfo).save();
  }

  public static getSkillsPrerequisites(): Promise<SkillPrerequisite[]> {
    return new SkillPrerequisites().fetch()
      .then((skillPrerequisites: Collection<SkillPrerequisite>) => {
        return skillPrerequisites.toArray();
      });
  }

  public static getSkillPrerequisites(skillId: number): Promise<Skill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchSkillPrerequisitesBySkill(skill)
      .then((skills: Collection<Skill>) => skills.toArray());
  }

  public static getSkillContributions(skillId: number): Promise<Skill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchContributingSkillsBySkill(skill)
      .then((skills: Collection<Skill>) => skills.toArray());
  }

  public static getSkill(skillId: number): Promise<Skill> {
    var fetchOptions: FetchOptions = {
      require: false
    }

    return this._initializeSkillByIdQuery(skillId)
      .fetch(fetchOptions);
  }

  public static getTeams(skillId: number): Promise<ITeamOfASkill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchSkillTeams(skill);
  }

  private static _initializeSkillByIdQuery(skillId: number): Skill {
    var queryCondition = {};
    queryCondition[Skill.idAttribute] = skillId;

    return new Skill(queryCondition);
  }

  private static _fetchSkillPrerequisitesBySkill(skill: Skill): Promise<Collection<Skill>> {
    var fetchOptions: CollectionFetchOptions = {
      require: false
    }

    return skill.prerequisiteSkills().fetch(fetchOptions);
  }

  private static _fetchContributingSkillsBySkill(skill: Skill): Promise<Collection<Skill>> {
    var fetchOptions: CollectionFetchOptions = {
      require: false
    }

    return skill.contributingSkills().fetch(fetchOptions);
  }

  private static _fetchSkillTeams(skill: Skill): Promise<ITeamOfASkill[]> {
    return skill.getTeams();
  }
}
