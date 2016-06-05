import {ITeamInfo} from "./interfaces/iTeamInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { Team, Teams } from './team';

chai.use(chaiAsPromised);

describe('Team', () => {

  describe('new', () => {
    var validTeamInfo: ITeamInfo;
    var validTeamInfo2: ITeamInfo;

    beforeEach(() => {
      validTeamInfo = {
        name: 'team name 1'
      };

      validTeamInfo2 = {
        name: 'team name 2'
      };

      return Teams.clearAll();
    });

    afterEach(() => {
      return Teams.clearAll();
    });

    it('create team with empty fields - should return error', () => {
      // Arrange
      var skill = new Team();

      // Act
      var promise: Promise<Team> = skill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create team with missing name - should return error', () => {
      // Arrange
      delete validTeamInfo.name;
      var skill = new Team(validTeamInfo);

      // Act
      var promise: Promise<Team> = skill.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create team with existing name should return error', () => {
      // Arrange
      var team1 = new Team(validTeamInfo);

      validTeamInfo2.name = validTeamInfo.name;
      var team2 = new Team(validTeamInfo2);

      // Act
      var promise: Promise<Team> =
        team1.save().then(
          () => team2.save(),
          () => { expect(true).to.be.false; });

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create team with empty name should return error', () => {
      // Arrange
      validTeamInfo.name = '';
      var team = new Team(validTeamInfo);

      // Act
      var promise: Promise<Team> = team.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create team with everything ok should save team correctly', () => {
      // Arrange
      var team = new Team(validTeamInfo);

      // Act
      var promise: Promise<Team> = team.save();

      // Assert
      return expect(promise).to.eventually.equal(team);
    });

    it('create team with everything ok should be fetched', () => {
      // Arrange
      var team = new Team(validTeamInfo);

      // Act
      var promise: Promise<Team> = team.save();

      // Assert
      var teamsPromise =
        promise.then(() => new Teams().fetch());

      return expect(teamsPromise).to.eventually.fulfilled
        .then((teams: Collection<Team>) => {
          expect(teams.size()).to.be.equal(1);
          expect(teams.at(0).attributes.name).to.be.equal(validTeamInfo.name);
        });
    });

  });

});

describe('Teams', () => {
  describe('clearAll', () => {

    it('should clear all the teams', () => {
      // Act
      var promise: Promise<void> = Teams.clearAll();

      // Assert
      var teamsPromise =
        promise.then(() => new Teams().fetch());

      return expect(teamsPromise).to.eventually.fulfilled
        .then((teams: Collection<Team>) => {
          expect(teams.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        Teams.clearAll().then(() => Teams.clearAll());

      // Assert
      var usersPromise =
        promise.then(() => new Teams().fetch());

      return expect(usersPromise).to.eventually.fulfilled;
    });

  });
});
