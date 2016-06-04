import {Collection} from 'bookshelf';
import {ISkillInfo, Skill, Skills} from '../models/skill';
import {ISkillPrerequisiteInfo, SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';

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
    return new Skill()
      .query({ where: { name: skillName } })
      .fetch();
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
}
