import {QuerySelectors} from "./querySelectors";
import {DataHandlerBase} from "./dataHandlerBase";
import {ISkillCreatorInfo} from "../models/interfaces/iSkillCreatorInfo";
import {SkillCreators} from "../models/skillCreator";
import {SkillCreator} from "../models/skillCreator";
import {IPrerequisitesOfASkill} from "../models/interfaces/iPrerequisitesOfASkill";
import {TeamSkills} from "../models/teamSkill";
import {ITeamsOfASkill} from "../models/interfaces/iTeamsOfASkill";
import {IDestroyOptions} from "./interfaces/iDestroyOptions";
import {ITeamOfASkill} from "../models/interfaces/iTeamOfASkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import {SaveOptions, Collection, FetchOptions, CollectionFetchOptions} from 'bookshelf';
import {Skill, Skills} from '../models/skill';
import {SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';
import * as bluebirdPromise from 'bluebird';
import {Transaction, QueryBuilder}from 'knex';
import {bookshelf} from '../../../bookshelf';

export class SkillsDataHandler extends DataHandlerBase {
  public static createSkill(skillInfo: ISkillInfo, creatorId: number): bluebirdPromise<Skill> {
    return bookshelf.transaction((_transaction: Transaction) => {
      var saveOptions: SaveOptions = {
        transacting: _transaction
      }

      var skill: Skill;
      var skillCreatorInfo: ISkillCreatorInfo;
      return new Skill(skillInfo).save(null, saveOptions)
        .then((_skill: Skill) => {
          skill = _skill;

          skillCreatorInfo = {
            user_id: creatorId,
            skill_id: skill.id
          };
        })
        .then(() => new SkillCreator(skillCreatorInfo).save(null, saveOptions))
        .then(() => {
          return skill;
        });
    });
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

  public static getSkillsByPartialSkillName(partialSkillName: string, maxNumberOfSkills: number = null): bluebirdPromise<Skill[]> {
    var likePartialSkillName = this._createLikeQueryValue(partialSkillName.toLowerCase());

    return new Skills().query((_queryBuilder: QueryBuilder) => {
      _queryBuilder.whereRaw(`LOWER(${Skill.nameAttribute}) ${QuerySelectors.LIKE} ?`, likePartialSkillName);

      if (maxNumberOfSkills !== null &&
        maxNumberOfSkills >= 0) {
        _queryBuilder.limit(maxNumberOfSkills);
      }
    }).fetch()
      .then((_skillsCollection: Collection<Skill>) => _skillsCollection.toArray());
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

  public static getSkillByName(name: string): bluebirdPromise<Skill> {
    var skill: Skill = this._initializeSkillByNameQuery(name);

    return skill.fetch();
  }

  public static getTeams(skillId: number): bluebirdPromise<ITeamOfASkill[]> {
    var skill: Skill = this._initializeSkillByIdQuery(skillId);

    return this._fetchSkillTeams(skill);
  }

  public static getTeamsOfSkills(): bluebirdPromise<ITeamsOfASkill[]> {
    return Skills.getTeamsOfSkills();
  }

  public static getSkillsCreators(): bluebirdPromise<SkillCreator[]> {
    return new SkillCreators().fetch()
      .then((_skillsCreatorsCollection: Collection<SkillCreator>) => {
        return _skillsCreatorsCollection.toArray();
      });
  }

  private static _initializeSkillByIdQuery(skillId: number): Skill {
    var queryCondition = {};
    queryCondition[Skill.idAttribute] = skillId;

    return new Skill(queryCondition);
  }

  private static _initializeSkillByNameQuery(name: string): Skill {
    var queryCondition = {};
    queryCondition[Skill.nameAttribute] = name;

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
