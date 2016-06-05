import {ITeamOfASkill} from "../models/interfaces/iTeamOfASkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {Collection} from 'bookshelf';
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

  public static getSkillPrerequisites(skillName: string): Promise<Skill[]> {
    return this.getSkill(skillName)
      .then((skill: Skill) => this.fetchSkillPrerequisitesBySkill(skill))
      .then((skills: Collection<Skill>) => skills.toArray());
  }

  public static getSkillContributions(skillName: string): Promise<Skill[]> {
    return this.getSkill(skillName)
      .then((skill: Skill) => this.fetchContributingSkillsBySkill(skill))
      .then((skills: Collection<Skill>) => skills.toArray());
  }

  public static getSkill(skillName: string): Promise<Skill> {
    var queryCondition = {};
    queryCondition[Skill.nameAttribute] = skillName;

    return new Skill()
      .query({ where: queryCondition })
      .fetch();
  }

  public static getTeams(skillName: string): Promise<ITeamOfASkill[]> {
    return this.getSkill(skillName)
      .then((skill: Skill) => this._fetchSkillTeams(skill));
  }

  private static fetchSkillPrerequisitesBySkill(skill: Skill): Promise<Collection<Skill>> {
    if (!skill) {
      return Promise.resolve(new Skills());
    }

    return skill.getPrerequisiteSkills().fetch();
  }

  private static fetchContributingSkillsBySkill(skill: Skill): Promise<Collection<Skill>> {
    if (!skill) {
      return Promise.resolve(new Skills());
    }

    return skill.getContributingSkills().fetch();
  }

  private static _fetchSkillTeams(skill: Skill): Promise<ITeamOfASkill[]> {
    if (!skill) {
      return Promise.resolve([]);
    }

    return skill.getTeams();
  }
}
