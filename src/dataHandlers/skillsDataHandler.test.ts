import {TeamSkillUpvotes} from "../models/teamSkillUpvote";
import {TeamSkill, TeamSkills} from "../models/teamSkill";
import {IUserInfo} from "../models/interfaces/iUserInfo";
import {TeamsDataHandler} from "./teamsDataHandler";
import {ITeamSkillInfo} from "../models/interfaces/iTeamSkillInfo";
import {ITeamInfo} from "../models/interfaces/iTeamInfo";
import {Team, Teams} from "../models/team";
import {ITeamOfASkill} from "../models/interfaces/iTeamOfASkill";
import {ISkillPrerequisiteInfo} from "../models/interfaces/iSkillPrerequisiteInfo";
import {ISkillInfo} from "../models/interfaces/iSkillInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as _ from 'lodash';
import * as chaiAsPromised from 'chai-as-promised'
import {Skill, Skills} from '../models/skill';
import {SkillPrerequisite, SkillPrerequisites} from '../models/skillPrerequisite';
import {SkillsDataHandler} from './skillsDataHandler';
import {UserDataHandler} from './userDataHandler';
import {User, Users} from '../models/user';


chai.use(chaiAsPromised);

describe('SkillsDataHandler', () => {

  function clearTables(): Promise<any> {
    return TeamSkillUpvotes.clearAll()
      .then(() => Promise.all([
        SkillPrerequisites.clearAll(),
        TeamSkills.clearAll()
      ])).then(() => Promise.all([
        Skills.clearAll(),
        Teams.clearAll(),
        Users.clearAll()
      ]));
  }

  beforeEach(() => {
    return clearTables();
  });

  afterEach(() => {
    return clearTables();
  });

  function createSkillInfo(skillNumber: number): ISkillInfo {
    var skillNumberString = skillNumber.toString();

    return {
      name: 'name ' + skillNumberString
    }
  }

  function verifySkillInfoAsync(actualSkillPromise: Promise<Skill>,
    expectedSkillInfo: ISkillInfo): Promise<void> {

    return expect(actualSkillPromise).to.eventually.fulfilled
      .then((skill: Skill) => {
        verifySkillInfo(skill.attributes, expectedSkillInfo);
      });
  }

  function verifySkillInfo(actual: ISkillInfo, expected: ISkillInfo): void {
    var actualCloned: ISkillInfo = _.clone(actual);
    var expectedCloned: ISkillInfo = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  function createSkillPrerequisiteInfo(skill: Skill, skillPrerequisite: Skill): ISkillPrerequisiteInfo {
    return {
      skill_id: skill.id,
      skill_prerequisite_id: skillPrerequisite.id
    }
  }

  function verifySkillPrerequisiteInfoAsync(actualSkillPrerequisitePromise: Promise<SkillPrerequisite>,
    expectedSkillPrerequisiteInfo: ISkillPrerequisiteInfo): Promise<void> {

    return expect(actualSkillPrerequisitePromise).to.eventually.fulfilled
      .then((skillPrerequisite: SkillPrerequisite) => {
        verifySkillPrerequisiteInfo(skillPrerequisite.attributes, expectedSkillPrerequisiteInfo);
      });
  }

  function verifySkillPrerequisiteInfo(actual: ISkillPrerequisiteInfo, expected: ISkillPrerequisiteInfo): void {
    var actualCloned: ISkillPrerequisiteInfo = _.clone(actual);
    var expectedCloned: ISkillPrerequisiteInfo = _.clone(expected);

    delete actualCloned['id'];
    delete expectedCloned['id'];

    expect(actualCloned).to.be.deep.equal(expectedCloned);
  }

  function verifySkillPrerequisitesInfoWithoutOrderAsync(actualSkillPrerequisitesPromise: Promise<SkillPrerequisite[]>,
    expectedSkillPrerequisitesInfo: ISkillPrerequisiteInfo[]): Promise<void> {

    return expect(actualSkillPrerequisitesPromise).to.eventually.fulfilled
      .then((skillPrerequisites: SkillPrerequisite[]) => {

        var actualSkillPrerequisitesInfos = _.map(skillPrerequisites, _ => _.attributes);

        verifyPrerequisitesInfoWithoutOrder(actualSkillPrerequisitesInfos, expectedSkillPrerequisitesInfo);
      });
  }

  function verifyPrerequisitesInfoWithoutOrder(actual: ISkillPrerequisiteInfo[], expected: ISkillPrerequisiteInfo[]): void {
    var actualOrdered = _.orderBy(actual, _ => _.skill_id);
    var expectedOrdered = _.orderBy(expected, _ => _.skill_id);

    expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

    for (var i = 0; i < expected.length; i++) {
      verifySkillPrerequisiteInfo(actualOrdered[i], expectedOrdered[i]);
    }
  }

  function verifySkillsInfoWithoutOrderAsync(actualSkillsPromise: Promise<Skill[]>,
    expectedSkillsInfo: ISkillInfo[]): Promise<void> {

    return expect(actualSkillsPromise).to.eventually.fulfilled
      .then((skills: Skill[]) => {

        var actualSkillInfos = _.map(skills, _ => _.attributes);

        verifySkillsInfoWithoutOrder(actualSkillInfos, expectedSkillsInfo);
      });
  }

  function verifySkillsInfoWithoutOrder(actual: ISkillInfo[], expected: ISkillInfo[]): void {
    var actualOrdered = _.orderBy(actual, _ => _.name);
    var expectedOrdered = _.orderBy(expected, _ => _.name);

    expect(actualOrdered.length).to.be.equal(expectedOrdered.length);

    for (var i = 0; i < expected.length; i++) {
      verifySkillInfo(actualOrdered[i], expectedOrdered[i]);
    }
  }

  describe('createSkill', () => {

    it('should create a skill correctly', () => {
      // Act
      var skillInfo: ISkillInfo = createSkillInfo(1);
      var skillPromise: Promise<Skill> =
        SkillsDataHandler.createSkill(skillInfo);

      // Assert
      return verifySkillInfoAsync(skillPromise, skillInfo);
    });

  });

  describe('getSkill', () => {

    it('no such skill should return null', () => {
      // Act
      var skillPromise: Promise<Skill> =
        SkillsDataHandler.getSkill('not existing skill');

      // Assert
      return expect(skillPromise).to.eventually.null;
    });

    it('skill exists should return correct skill', () => {
      // Arrange
      var skillInfo: ISkillInfo = createSkillInfo(1);
      var createSkillPromise: Promise<Skill> =
        SkillsDataHandler.createSkill(skillInfo);

      // Act
      var getSkillPromise: Promise<Skill> =
        createSkillPromise.then(() => SkillsDataHandler.getSkill(skillInfo.name));

      // Assert
      return verifySkillInfoAsync(getSkillPromise, skillInfo);
    });

  });

  describe('getSkills', () => {

    it('no skills should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> = SkillsDataHandler.getSkills();

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfo);
    });

    it('should return all created skills', () => {
      // Arrange
      var skillInfo1: ISkillInfo = createSkillInfo(1);
      var skillInfo2: ISkillInfo = createSkillInfo(2);
      var skillInfo3: ISkillInfo = createSkillInfo(3);

      var createAllSkillsPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2),
          SkillsDataHandler.createSkill(skillInfo3)
        ]);

      // Act
      var skillsPromose: Promise<Skill[]> =
        createAllSkillsPromise.then(() => SkillsDataHandler.getSkills());

      // Assert
      var expectedSkillsInfo: ISkillInfo[] = [skillInfo1, skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromose, expectedSkillsInfo);
    });

  });

  describe('addSkillPrerequisite', () => {

    it('should create a skillPrerequisite', () => {
      // Act
      var skillInfo1: ISkillInfo = createSkillInfo(1);
      var skillInfo2: ISkillInfo = createSkillInfo(2);

      var createAllSkillsPromise =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2)
        ]);

      var skillPrerequisitePromise: Promise<SkillPrerequisite> =
        createAllSkillsPromise.then((skills: Skill[]) => {
          var skill1 = skills[0];
          var skill2 = skills[1];

          var skillPrerequisiteInfo: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);

          return SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
        });

      // Assert
      return expect(skillPrerequisitePromise).to.eventually.fulfilled;
    });

  });

  describe('getSkillsPrerequisites', () => {

    it('no skill prerequisites should return empty', () => {
      // Act
      var prerequisitesPromise: Promise<SkillPrerequisite[]> = SkillsDataHandler.getSkillsPrerequisites();

      // Assert
      var expectedPrerequisitesInfo: ISkillPrerequisiteInfo[] = [];
      return verifySkillPrerequisitesInfoWithoutOrderAsync(prerequisitesPromise, expectedPrerequisitesInfo);
    });

    it('should return all created skill prerequisites', () => {
      // Arrange
      var skillInfo1: ISkillInfo = createSkillInfo(1);
      var skillInfo2: ISkillInfo = createSkillInfo(2);

      var createAllSkillsPromise =
        Promise.all([
          SkillsDataHandler.createSkill(skillInfo1),
          SkillsDataHandler.createSkill(skillInfo2)
        ]);

      var skillPrerequisiteInfo1: ISkillPrerequisiteInfo;
      var skillPrerequisiteInfo2: ISkillPrerequisiteInfo;

      var createAllSkillPrerequisitesPromise: Promise<any> =
        createAllSkillsPromise.then((skills: Skill[]) => {
          var skill1: Skill = skills[0];
          var skill2: Skill = skills[1];

          skillPrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
          skillPrerequisiteInfo2 = createSkillPrerequisiteInfo(skill2, skill1);

          return Promise.all([
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo1),
            SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo2),
          ])
        });

      // Act
      var skillPrerequisitesPromise: Promise<SkillPrerequisite[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillsPrerequisites());

      // Assert
      return skillPrerequisitesPromise.then(() => {
        var expectedSkillPrerequisitesInfos: ISkillPrerequisiteInfo[] = [skillPrerequisiteInfo1, skillPrerequisiteInfo2];

        return verifySkillPrerequisitesInfoWithoutOrderAsync(skillPrerequisitesPromise, expectedSkillPrerequisitesInfos)
      });
    });

  });

  describe('getSkillPrerequisites', () => {

    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;
    var skillInfo3: ISkillInfo;

    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    beforeEach(() => {
      skillInfo1 = createSkillInfo(1);
      skillInfo2 = createSkillInfo(2);
      skillInfo3 = createSkillInfo(3);

      return Promise.all([
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        SkillsDataHandler.createSkill(skillInfo3)
      ]).then((skills: Skill[]) => {
        skill1 = skills[0];
        skill2 = skills[1];
        skill3 = skills[2];
      });
    });

    it('no such skill should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillPrerequisites('not existing skill');

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('no skill prerequisites should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillPrerequisites(skillInfo1.name);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('should return all existing skill prerequisites', () => {
      // Arrange
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill3);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillPrerequisites(skillInfo1.name));

      // Assert
      var expectedSkillsInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
    });

    it('should return all existing skill prerequisites and not return other prerequisites', () => {
      // Arrange
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill3);

      var skill2PrerequisiteInfo: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2),
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillPrerequisites(skillInfo1.name));

      // Assert
      var expectedSkillsInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
    });

  });

  describe('getSkillContributions', () => {

    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;
    var skillInfo3: ISkillInfo;

    var skill1: Skill;
    var skill2: Skill;
    var skill3: Skill;

    beforeEach(() => {
      skillInfo1 = createSkillInfo(1);
      skillInfo2 = createSkillInfo(2);
      skillInfo3 = createSkillInfo(3);

      return Promise.all([
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        SkillsDataHandler.createSkill(skillInfo3)
      ]).then((skills: Skill[]) => {
        skill1 = skills[0];
        skill2 = skills[1];
        skill3 = skills[2];
      });
    });

    it('no such skill should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillContributions('not existing skill');

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('no skill prerequisites should return empty', () => {
      // Act
      var skillsPromise: Promise<Skill[]> =
        SkillsDataHandler.getSkillContributions(skillInfo1.name);

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('no skill prerequisites leading to skill should return empty', () => {
      // Act
      var skill1PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill3);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
        ]);

      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(
          () => SkillsDataHandler.getSkillContributions(skillInfo1.name));

      // Assert
      var expectedInfo: ISkillInfo[] = [];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
    });

    it('should return all existing skills with prerequisites of this skill', () => {
      // Arrange
      var skill2PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);
      var skill3PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill3, skill1);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillContributions(skillInfo1.name));

      // Assert
      var expectedSkillInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
    });

    it('should return all existing skill with prerequisites of this skill and not return other skills', () => {
      // Arrange
      var skill2PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);
      var skill3PrerequisiteInfo1: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill3, skill1);

      var skill1PrerequisiteInfo2: ISkillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);

      var createAllSkillPrerequisitesPromise: Promise<any> =
        Promise.all([
          SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
          SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
        ]);

      // Act
      var skillsPromise: Promise<Skill[]> =
        createAllSkillPrerequisitesPromise.then(() => SkillsDataHandler.getSkillContributions(skillInfo1.name));

      // Assert
      var expectedSkillInfos: ISkillInfo[] = [skillInfo2, skillInfo3];
      return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
    });

  });

  describe('getTeams', () => {

    interface ITeamIdToUpvotes {
      teamId: number;
      upvotingUserIds: number[];
    }

    function verifyTeamsAsync(actualTeamsPromise: Promise<ITeamOfASkill[]>,
      expectedTeams: ITeamInfo[]): Promise<void> {
      return expect(actualTeamsPromise).to.eventually.fulfilled
        .then((actualTeams: ITeamOfASkill[]) => {
          var actualTeamInfos: ITeamInfo[] = _.map(actualTeams, _ => _.team.attributes);

          verifyTeams(actualTeamInfos, expectedTeams);
        });
    }

    function verifyTeams(actual: ITeamInfo[], expected: ITeamInfo[]): void {
      var actualOrdered: ITeamInfo[] = _.orderBy(actual, _ => _.name);
      var expectedOrdered: ITeamInfo[] = _.orderBy(expected, _ => _.name);
      expect(actual.length).to.be.equal(expected.length);

      for (var i = 0; i < expected.length; i++) {
        verifyTeam(actualOrdered[i], expectedOrdered[i]);
      }
    }

    function verifyTeam(actual: ITeamInfo, expected: ITeamInfo): void {
      var actualCloned: ITeamInfo = _.clone(actual);
      var expectedCloned: ITeamInfo = _.clone(expected);

      delete actualCloned['id'];
      delete expectedCloned['id'];

      expect(actualCloned).to.be.deep.equal(expectedCloned);
    }

    function createTeamInfo(teamName: string): ITeamInfo {
      return {
        name: teamName
      };
    }

    function createTeamSkillInfo(team: Team, skill: Skill): ITeamSkillInfo {
      return {
        team_id: team.id,
        skill_id: skill.id
      }
    }

    function verifyTeamUpvotingUsersAsync(actualTeamsOfSkillPromise: Promise<ITeamOfASkill[]>,
      expectedSkillUpdvotes: ITeamIdToUpvotes[]): Promise<void> {

      return expect(actualTeamsOfSkillPromise).to.eventually.fulfilled
        .then((actualTeams: ITeamOfASkill[]) => {
          var orderedActualTeams: ITeamOfASkill[] = _.orderBy(actualTeams, _ => _.team.id);
          var actualUpvodtingUserIds: number[][] = _.map(orderedActualTeams, _ => _.upvotingUserIds.sort());

          var orderedExpectedUpvotes: ITeamIdToUpvotes[] = _.orderBy(expectedSkillUpdvotes, _ => _.teamId);
          var expectedUpvotingUserIds: number[][] = _.map(orderedExpectedUpvotes, _ => _.upvotingUserIds.sort());

          expect(actualUpvodtingUserIds).to.deep.equal(expectedUpvotingUserIds);
        });
    }

    function createUserInfo(userNumber): IUserInfo {
      return {
        username: 'username' + userNumber,
        password_hash: 'password' + userNumber,
        email: 'email' + userNumber + '@gmail.com',
        firstName: 'firstName' + userNumber,
        lastName: 'lastName' + userNumber
      };
    }

    var teamInfo1: ITeamInfo;
    var teamInfo2: ITeamInfo;
    var teamInfo3: ITeamInfo;
    var skillInfo1: ISkillInfo;
    var skillInfo2: ISkillInfo;

    var team1: Team;
    var team2: Team;
    var team3: Team;
    var skill1: Skill;
    var skill2: Skill;

    var userInfo1: IUserInfo;
    var userInfo2: IUserInfo;
    var user1: User;
    var user2: User;

    beforeEach(() => {
      teamInfo1 = createTeamInfo('a');
      teamInfo2 = createTeamInfo('b');
      teamInfo3 = createTeamInfo('c');

      skillInfo1 = createSkillInfo(1);
      skillInfo2 = createSkillInfo(2);

      userInfo1 = createUserInfo(1);
      userInfo2 = createUserInfo(2);

      return Promise.all([
        TeamsDataHandler.createTeam(teamInfo1),
        TeamsDataHandler.createTeam(teamInfo2),
        TeamsDataHandler.createTeam(teamInfo3),
        SkillsDataHandler.createSkill(skillInfo1),
        SkillsDataHandler.createSkill(skillInfo2),
        UserDataHandler.createUser(userInfo1),
        UserDataHandler.createUser(userInfo2)
      ]).then((results: any[]) => {
        team1 = results[0];
        team2 = results[1];
        team3 = results[2];
        skill1 = results[3];
        skill2 = results[4];
        user1 = results[5];
        user2 = results[6];
      });
    });

    it('no such skill should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        SkillsDataHandler.getTeams('not existing skill');

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('skill exists but has no teams should return empty teams list', () => {
      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        SkillsDataHandler.getTeams(skillInfo1.name);

      // Assert
      return expect(teamsPromise).to.eventually.deep.equal([]);
    });

    it('skill exists with teams should return correct teams', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team2, skill1);

      // Assert
      var addSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeams(skillInfo1.name));

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return verifyTeamsAsync(teamsPromise, expectedTeams);
    });

    it('skill exists with teams should return correct upvoting user ids', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team2, skill1);
      var teamSkillInfo3: ITeamSkillInfo = createTeamSkillInfo(team3, skill1);

      // Assert
      var addSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeams(skillInfo1.name));

      // Assert
      var expectedSkillUpvotes: ITeamIdToUpvotes[] =
        [
          { teamId: teamSkillInfo1.team_id, upvotingUserIds: [] },
          { teamId: teamSkillInfo2.team_id, upvotingUserIds: [] },
          { teamId: teamSkillInfo3.team_id, upvotingUserIds: [] }
        ];
      return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
    });

    it('multiple skills exist with teams should return correct teams', () => {
      // Arrange
      var teamSkillInfo1: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var teamSkillInfo2: ITeamSkillInfo = createTeamSkillInfo(team2, skill1);

      var teamSkillInfo3: ITeamSkillInfo = createTeamSkillInfo(team1, skill2);

      // Assert
      var addSkillsPromise: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(teamSkillInfo1),
          TeamsDataHandler.addTeamSkill(teamSkillInfo2),
          TeamsDataHandler.addTeamSkill(teamSkillInfo3)
        ]);

      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        addSkillsPromise.then(() => SkillsDataHandler.getTeams(skillInfo1.name));

      // Assert
      var expectedTeams: ITeamInfo[] = [teamInfo1, teamInfo2];
      return verifyTeamsAsync(teamsPromise, expectedTeams);
    });

    it('skill exists with teams with upvotes should return correct upvoting user ids', () => {
      // Arrange
      var team1SkillInfo: ITeamSkillInfo = createTeamSkillInfo(team1, skill1);
      var team2SkillInfo: ITeamSkillInfo = createTeamSkillInfo(team2, skill1);
      var team3SkillInfo: ITeamSkillInfo = createTeamSkillInfo(team3, skill1);

      var addSkillsAndUpvote: Promise<any> =
        Promise.all([
          TeamsDataHandler.addTeamSkill(team1SkillInfo),
          TeamsDataHandler.addTeamSkill(team2SkillInfo),
          TeamsDataHandler.addTeamSkill(team3SkillInfo)
        ]).then((teamSkills: TeamSkill[]) => {
          var [team1Skill, team2Skill, team3Skill] = teamSkills;
          return Promise.all([
            TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user1.id),
            TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user2.id),
            TeamsDataHandler.upvoteTeamSkill(team2Skill.id, user2.id),
          ])
        });

      // Act
      var teamsPromise: Promise<ITeamOfASkill[]> =
        addSkillsAndUpvote.then(() => SkillsDataHandler.getTeams(skillInfo1.name));

      // Assert
      var expectedSkillUpvotes: ITeamIdToUpvotes[] =
        [
          { teamId: team1.id, upvotingUserIds: [user1.id, user2.id] },
          { teamId: team2.id, upvotingUserIds: [user2.id] },
          { teamId: team3.id, upvotingUserIds: [] }
        ];
      return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
    });

  });

});
