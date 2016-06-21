import {EnvironmentCleaner} from "../testUtils/environmentCleaner";
import {ModelInfoMockFactory} from "../testUtils/modelInfoMockFactory";
import {ITeamMemberInfo} from "./interfaces/iTeamMemberInfo";
import {ITeamInfo} from "./interfaces/iTeamInfo";
import {IUserInfo} from "./interfaces/iUserInfo";
import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised';
import { Team, Teams } from './team';
import { User, Users } from './user';
import { TeamMember, TeamMembers } from './teamMember';
import * as bluebirdPromise from 'bluebird';

chai.use(chaiAsPromised);

describe('TeamMember', () => {
  describe('new', () => {
    var user1: User;
    var user2: User;
    var team1: Team;

    beforeEach(() => {
      return EnvironmentCleaner.clearTables()
        .then(() => bluebirdPromise.all([
          new User(ModelInfoMockFactory.createUserInfo(1)).save(),
          new User(ModelInfoMockFactory.createUserInfo(2)).save(),
          new Team(ModelInfoMockFactory.createTeamInfo('a')).save(),
        ]))
        .then((usersAndTeams: any[]) => {
          user1 = usersAndTeams[0];
          user2 = usersAndTeams[1];
          team1 = usersAndTeams[2];
        });
    });

    afterEach(() => {
      return EnvironmentCleaner.clearTables();
    });

    it('create without any fields should return error', () => {
      /// Arrange
      var teamMember = new TeamMember();

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without team_id should return error', () => {
      /// Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      delete teamMemberInfo.team_id;

      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without user_id should return error', () => {
      /// Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      delete teamMemberInfo.user_id;

      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create without is_admin should succeed', () => {
      /// Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      delete teamMemberInfo.is_admin;

      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.equal(teamMember);
    });

    it('create with non integer team_id should return error', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo.team_id = 1.1;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non integer user_id should return error', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo.user_id = 1.1;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing team_id should return error', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo.team_id = team1.id + 1;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with non existing user_id name should return error', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo.user_id = user1.id + user2.id + 1;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.rejected;
    });

    it('create with existing team_id and user_id should succeed', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      return expect(promise).to.eventually.equal(teamMember);
    });

    it('create with existing team_id and user_id should be fetched', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled
        .then((teamMembers: Collection<TeamMember>) => {
          var teamMember: TeamMember = teamMembers.at(0);

          expect(teamMembers.size()).to.be.equal(1);
          expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
          expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
          expect(teamMember.attributes.is_admin).to.be.equal(teamMemberInfo.is_admin);
        });
    });

    it('create with is_admin false should be fetched correctly', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo.is_admin = false;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled
        .then((teamMembers: Collection<TeamMember>) => {
          var teamMember: TeamMember = teamMembers.at(0);

          expect(teamMembers.size()).to.be.equal(1);
          expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
          expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
          expect(teamMember.attributes.is_admin).to.be.false;
        });
    });

    it('create with is_admin true should be fetched correctly', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      teamMemberInfo.is_admin = true;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled
        .then((teamMembers: Collection<TeamMember>) => {
          var teamMember: TeamMember = teamMembers.at(0);

          expect(teamMembers.size()).to.be.equal(1);
          expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
          expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
          expect(teamMember.attributes.is_admin).to.be.true;
        });
    });

    it('create without is_admin should be fetched correctly', () => {
      // Arrange
      var teamMemberInfo: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      delete teamMemberInfo.is_admin;
      var teamMember = new TeamMember(teamMemberInfo);

      // Act
      var promise: Promise<TeamMember> = teamMember.save();

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled
        .then((teamMembers: Collection<TeamMember>) => {
          var teamMember: TeamMember = teamMembers.at(0);

          expect(teamMembers.size()).to.be.equal(1);
          expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
          expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
          expect(teamMember.attributes.is_admin).to.be.false;
        });
    });

    it('create 2 different team members should succeed', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user2);

      var teamMember1 = new TeamMember(teamMemberInfo1);
      var teamMember2 = new TeamMember(teamMemberInfo2);

      // Act
      var promise: Promise<TeamMember> =
        teamMember1.save()
          .then(() => teamMember2.save());

      // Assert
      return expect(promise).to.eventually.equal(teamMember2);
    });

    it('create 2 different team members should be fetched', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user2);

      var teamMember1 = new TeamMember(teamMemberInfo1);
      var teamMember2 = new TeamMember(teamMemberInfo2);

      // Act
      var promise: Promise<TeamMember> =
        teamMember1.save()
          .then(() => teamMember2.save());

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled
        .then((teamMembers: Collection<TeamMember>) => {
          expect(teamMembers.size()).to.be.equal(2);
        });
    });

    it('create 2 same prerequisites should return error', () => {
      // Arrange
      var teamMemberInfo1: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
      var teamMemberInfo2: ITeamMemberInfo = ModelInfoMockFactory.createTeamMemberInfo(team1, user1);

      var teamMember1 = new TeamMember(teamMemberInfo1);
      var teamMember2 = new TeamMember(teamMemberInfo2);

      // Act
      var promise: Promise<TeamMember> =
        teamMember1.save()
          .then(() => teamMember2.save());

      // Assert
      return expect(promise).to.eventually.rejected;
    });
  });
});

describe('TeamMembers', () => {
  describe('clearAll', () => {

    it('should clear all the team members', () => {
      // Act
      var promise: Promise<void> = TeamMembers.clearAll();

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled
        .then((teamMembers: Collection<TeamMember>) => {
          expect(teamMembers.size()).to.be.equal(0);
        });
    });

    it('should not fail on empty table', () => {
      // Act
      var promise: Promise<void> =
        TeamMembers.clearAll().then(() => TeamMembers.clearAll());

      // Assert
      var teamMembersPromise =
        promise.then(() => new TeamMembers().fetch());

      return expect(teamMembersPromise).to.eventually.fulfilled;
    });

  });
});
