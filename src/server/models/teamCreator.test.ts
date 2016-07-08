import {EnvironmentDirtifier} from "../testUtils/environmentDirtifier";
import {User} from "./user";
import {IUserInfo} from "./interfaces/iUserInfo";
import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ITeamCreatorInfo} from "./interfaces/iTeamCreatorInfo";
import {ITeamInfo} from "./interfaces/iTeamInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { Team, Teams } from './team';
import { TeamCreator, TeamCreators } from './teamCreator';

chai.use(chaiAsPromised);

describe('TeamCreator', () => {
  describe('new', () => {
    var team: Team;
    var user: User;
    var otherTeam: Team;

    var teamCreatorInfo: ITeamCreatorInfo;

    beforeEach(() => {
      var teamInfo1: ITeamInfo = {
        name: 'team name 1'
      };
      var teamInfo2: ITeamInfo = {
        name: 'team name 2'
      };

      return EnvironmentCleaner.clearTables()
        .then(() => EnvironmentDirtifier.createUsers(1))
        .then((_users: User[]) => {
          [user] = _users;
        })
        .then(() => Promise.all([
          new Team(teamInfo1).save(),
          new Team(teamInfo2).save()
        ]))
        .then((_teams: Team[]) => {
          [team, otherTeam] = _teams;

          teamCreatorInfo = {
            user_id: user.id,
            team_id: team.id
          }
        });
    });

    afterEach(() => {
      return EnvironmentCleaner.clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var creator = new TeamCreator();

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without team_id should return error', () => {
      /// Arrange
      delete teamCreatorInfo.team_id;
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without user_id should return error', () => {
      /// Arrange
      delete teamCreatorInfo.user_id;
      var prerequisite = new TeamCreator(teamCreatorInfo);

      // Act
      var creator: Promise<TeamCreator> = prerequisite.save();

      // Assert
      return expect(creator).to.eventually.rejected;
    });

    it('create with non integer team_id should return error', () => {
      /// Arrange
      teamCreatorInfo.team_id = 1.1;
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer user_id should return error', () => {
      /// Arrange
      teamCreatorInfo.user_id = 1.1;
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing team_id should return error', () => {
      /// Arrange
      teamCreatorInfo.team_id = team.id + otherTeam.id + 1;
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing user_id should return error', () => {
      // Arrange
      teamCreatorInfo.user_id = user.id + 1;
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with existing team_id and user_id should succeed', () => {
      /// Arrange
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      return expect(promise).to.eventually.equal(creator);
    });

    it('create with existing team_id and user_id should be fetched', () => {
      /// Arrange
      var creator = new TeamCreator(teamCreatorInfo);

      // Act
      var promise: Promise<TeamCreator> = creator.save();

      // Assert
      var creatorsPromise =
        promise.then(() => new TeamCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled
        .then((_creatorsCollection: Collection<TeamCreator>) => {
          expect(_creatorsCollection.size()).to.be.equal(1);
          expect(_creatorsCollection.at(0).attributes.team_id).to.be.equal(teamCreatorInfo.team_id);
          expect(_creatorsCollection.at(0).attributes.user_id).to.be.equal(teamCreatorInfo.user_id);
        });
    });

    it('create 2 different teams with same creator should succeed', () => {
      // Arrange
      var creatorInfo1: ITeamCreatorInfo = {
        team_id: team.id,
        user_id: user.id
      };

      var creatorInfo2: ITeamCreatorInfo = {
        team_id: otherTeam.id,
        user_id: user.id
      };

      var creator1 = new TeamCreator(creatorInfo1);
      var creator2 = new TeamCreator(creatorInfo2);

      // Act
      var promise: Promise<TeamCreator> =
        creator1.save()
          .then(() => creator2.save());

      // Assert
      return expect(promise).to.eventually.equal(creator2);
    });

    it('create 2 different teams with same creator should be fetched', () => {
      // Arrange
      var creatorInfo1: ITeamCreatorInfo = {
        team_id: team.id,
        user_id: user.id
      };

      var creatorInfo2: ITeamCreatorInfo = {
        team_id: otherTeam.id,
        user_id: user.id
      };

      var creator1 = new TeamCreator(creatorInfo1);
      var creator2 = new TeamCreator(creatorInfo2);

      // Act
      var promise: Promise<TeamCreator> =
        creator1.save()
          .then(() => creator2.save());

      // Assert
      var creatorsPromise =
        promise.then(() => new TeamCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled
        .then((_creators: Collection<TeamCreator>) => {
          expect(_creators.size()).to.be.equal(2);
        });
    });

    it('create 2 creators with same team should return error', () => {
      var creatorInfo1: ITeamCreatorInfo = {
        team_id: team.id,
        user_id: user.id
      };

      var creatorInfo2: ITeamCreatorInfo = {
        team_id: creatorInfo1.team_id,
        user_id: creatorInfo1.user_id
      };

      var creator1 = new TeamCreator(creatorInfo1);
      var creator2 = new TeamCreator(creatorInfo2);

      // Act
      var promise: Promise<TeamCreator> =
        creator1.save()
          .then(() => creator2.save());

      // Assert
      return expect(promise).to.eventually.rejected;
    });
  });
});

describe('TeamCreators', () => {
  describe('clearAll', () => {

    it('should clear all the creators', () => {
      // Act
      var promise: Promise<void> = TeamCreators.clearAll();

      // Assert
      var creatorsPromise =
        promise.then(() => new TeamCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled
        .then((_creators: Collection<TeamCreator>) => {
          expect(_creators.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        TeamCreators.clearAll().then(() => TeamCreators.clearAll());

      // Assert
      var creatorsPromise =
        promise.then(() => new TeamCreators().fetch());

      return expect(creatorsPromise).to.eventually.fulfilled;
    });

  });
});
