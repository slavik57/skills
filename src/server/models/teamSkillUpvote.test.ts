import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {UserDataHandler} from "../dataHandlers/userDataHandler";
import {TeamsDataHandler} from "../dataHandlers/teamsDataHandler";
import {SkillsDataHandler} from "../dataHandlers/skillsDataHandler";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {User, Users} from "./user";
import {ITeamSkillUpvoteInfo} from "./interfaces/iTeamSkillUpvoteInfo";
import {ITeamSkillInfo} from "./interfaces/iTeamSkillInfo";
import {ITeamInfo} from "./interfaces/iTeamInfo";
import {ISkillInfo} from "./interfaces/iSkillInfo";
import {TeamSkill, TeamSkills} from "./teamSkill";
import {Team, Teams} from "./team";
import {Skill, Skills} from "./skill";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised';
import {TeamSkillUpvote, TeamSkillUpvotes} from './teamSkillUpvote';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

describe('TeamSkillUpvote', () => {

  describe('new', () => {
    var skill: Skill;
    var team: Team;
    var user1: User;
    var user2: User;

    var teamSkill: TeamSkill;

    beforeEach(() => {
      return EnvironmentCleaner.clearTables()
        .then(() => bluebirdPromise.all([
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)),
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
        ]))
        .then((_users: User[]) => {
          [user1, user2] = _users;
        })
        .then(() => bluebirdPromise.all([
          SkillsDataHandler.createSkill(ModelInfoMockFactory.createSkillInfo('skill1'), user1.id),
          TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team1'), user1.id),
        ]))
        .then((results: any[]) => {
          [skill, team] = results;

          return Promise.all([
            TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team, skill)),
          ]);
        }).then((teamSkills: TeamSkill[]) => {
          [teamSkill] = teamSkills;
        });
    });

    afterEach(() => {
      return EnvironmentCleaner.clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var teamSkillUpvote = new TeamSkillUpvote();

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = teamSkillUpvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without team_skill_id should return error', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      delete upvoteInfo.team_skill_id;

      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without user_id should return error', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      delete upvoteInfo.user_id;

      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer team_skill_id should return error', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      upvoteInfo.team_skill_id = 1.1;
      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer user_id should return error', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      upvoteInfo.user_id = 1.1;
      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing team_skill_id should return error', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      upvoteInfo.team_skill_id = 99999;
      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing user_id should return error', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      upvoteInfo.user_id = 99999;
      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with existing team_skill_id and user_id should succeed', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      return expect(promise).to.eventually.equal(upvote);
    });

    it('create with existing team_skill_id and user_id should be fetched', () => {
      // Arrange
      var upvoteInfo: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      var upvote = new TeamSkillUpvote(upvoteInfo);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> = upvote.save();

      // Assert
      var upvotesPromise =
        promise.then(() => new TeamSkillUpvotes().fetch());

      return expect(upvotesPromise).to.eventually.fulfilled
        .then((upvotes: Collection<TeamSkillUpvote>) => {
          var upvote: TeamSkillUpvote = upvotes.at(0);

          expect(upvotes.size()).to.be.equal(1);
          expect(upvote.attributes.team_skill_id).to.be.equal(upvoteInfo.team_skill_id);
          expect(upvote.attributes.user_id).to.be.equal(upvoteInfo.user_id);
        });
    });

    it('create 2 different team skills should succeed', () => {
      // Arrange
      var upvoteInfo1: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      var upvoteInfo2: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user2);

      var upvote1 = new TeamSkillUpvote(upvoteInfo1);
      var upvote2 = new TeamSkillUpvote(upvoteInfo2);

      var promise: bluebirdPromise<TeamSkillUpvote> =
        upvote1.save()
          .then(() => upvote2.save());

      // Assert
      return expect(promise).to.eventually.equal(upvote2);
    });

    it('create 2 different team skills should be fetched', () => {
      // Arrange
      var upvoteInfo1: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      var upvoteInfo2: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user2);

      var upvote1 = new TeamSkillUpvote(upvoteInfo1);
      var upvote2 = new TeamSkillUpvote(upvoteInfo2);

      var promise: bluebirdPromise<TeamSkillUpvote> =
        upvote1.save()
          .then(() => upvote2.save());

      // Assert
      var upvotesPromise =
        promise.then(() => new TeamSkillUpvotes().fetch());

      return expect(upvotesPromise).to.eventually.fulfilled
        .then((upvotes: Collection<TeamSkillUpvote>) => {
          expect(upvotes.size()).to.be.equal(2);
        });
    });

    it('create 2 same skills should return error', () => {
      // Arrange
      var upvoteInfo1: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);
      var upvoteInfo2: ITeamSkillUpvoteInfo =
        ModelInfoMockFactory.createTeamSkillUpvoteInfo(teamSkill, user1);

      var upvote1 = new TeamSkillUpvote(upvoteInfo1);
      var upvote2 = new TeamSkillUpvote(upvoteInfo2);

      // Act
      var promise: bluebirdPromise<TeamSkillUpvote> =
        upvote1.save()
          .then(() => upvote2.save());

      // Assert
      return expect(promise).to.eventually.rejected;
    });
  });

});

describe('TeamSkillUpvotes', () => {
  describe('clearAll', () => {

    it('should clear all the team skill upvotes', () => {
      // Act
      var promise: bluebirdPromise<void> = TeamSkillUpvotes.clearAll();

      // Assert
      var upvotesPromise =
        promise.then(() => new TeamSkillUpvotes().fetch());

      return expect(upvotesPromise).to.eventually.fulfilled
        .then((teamSkills: Collection<TeamSkillUpvote>) => {
          expect(teamSkills.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: bluebirdPromise<void> =
        TeamSkillUpvotes.clearAll().then(() => TeamSkillUpvotes.clearAll());

      // Assert
      var upvotesPromise =
        promise.then(() => new TeamSkillUpvotes().fetch());

      return expect(upvotesPromise).to.eventually.fulfilled;
    });

  });
});
