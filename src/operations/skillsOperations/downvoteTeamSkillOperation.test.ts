import {ISkillOfATeam} from "../../models/interfaces/iSkillOfATeam";
import {GlobalPermission} from "../../models/enums/globalPermission";
import {TeamSkill} from "../../models/teamSkill";
import {SkillsDataHandler} from "../../dataHandlers/skillsDataHandler";
import {TeamsDataHandler} from "../../dataHandlers/teamsDataHandler";
import {ModelInfoMockFactory} from "../../testUtils/modelInfoMockFactory";
import {UserDataHandler} from "../../dataHandlers/userDataHandler";
import {User} from "../../models/user";
import {Team} from "../../models/team";
import {Skill} from "../../models/skill";
import {EnvironmentCleaner} from "../../testUtils/environmentCleaner";
import {DownvoteTeamSkillOperation} from './downvoteTeamSkillOperation';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('DownvoteTeamSkillOperation', () => {

  var team: Team;
  var skillToDownvote: Skill;
  var teamSkillToDownvote: TeamSkill;
  var executingUser: User;
  var operation: DownvoteTeamSkillOperation;

  beforeEach(() => {
    return EnvironmentCleaner.clearTables()
      .then(() => UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(1)))
      .then((_user: User) => {
        executingUser = _user;
      })
      .then(() => TeamsDataHandler.createTeam(ModelInfoMockFactory.createTeamInfo('team')))
      .then((_team: Team) => {
        team = _team;
      })
      .then(() => SkillsDataHandler.createSkill(ModelInfoMockFactory.createSkillInfo('skill')))
      .then((_skill: Skill) => {
        skillToDownvote = _skill;
      })
      .then(() => TeamsDataHandler.addTeamSkill(ModelInfoMockFactory.createTeamSkillInfo(team, skillToDownvote)))
      .then((_teamSkill: TeamSkill) => {
        teamSkillToDownvote = _teamSkill;
      })
      .then(() => {
        operation = new DownvoteTeamSkillOperation(skillToDownvote.id, team.id, executingUser.id);
      });
  });

  afterEach(() => {
    return EnvironmentCleaner.clearTables();
  });

  describe('canExecute', () => {

    describe('skill is not a team skill', () => {

      beforeEach(() => {
        return TeamsDataHandler.removeTeamSkill(team.id, skillToDownvote.id);
      });

      it('executing user has all permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('skill has no upvotes', () => {

      it('executing user has all permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('skill has upvote from different user', () => {

      var otherUser: User;

      beforeEach(() => {
        var createOtherUserPromise: Promise<any> =
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
            .then((_user: User) => {
              otherUser = _user;
            })

        return createOtherUserPromise
          .then(() => TeamsDataHandler.upvoteTeamSkill(teamSkillToDownvote.id, otherUser.id));
      });

      it('executing user has all permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('skill has upvote from executing user', () => {

      beforeEach(() => {
        return TeamsDataHandler.upvoteTeamSkill(teamSkillToDownvote.id, executingUser.id);
      });

      it('executing user has no permissions should fail', () => {
        // Act
        var resultPromise: Promise<any> = operation.canExecute();

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

      it('executing user has GUEST permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

      it('executing user has READER permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.READER
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

      it('executing user has SKILLS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

      it('executing user has TEAMS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

      it('executing user has ADMIN permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.canExecute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled;
      });

    });

  });

  describe('execute', () => {

    describe('skill is not a team skill', () => {

      beforeEach(() => {
        return TeamsDataHandler.removeTeamSkill(team.id, skillToDownvote.id);
      });

      it('executing user has all permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('skill has no upvotes', () => {

      it('executing user has all permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.rejected;
      });

    });

    describe('skill has upvote from different user', () => {

      var otherUser: User;

      beforeEach(() => {
        var createOtherUserPromise: Promise<any> =
          UserDataHandler.createUser(ModelInfoMockFactory.createUserInfo(2))
            .then((_user: User) => {
              otherUser = _user;
            })

        return createOtherUserPromise
          .then(() => TeamsDataHandler.upvoteTeamSkill(teamSkillToDownvote.id, otherUser.id));
      });

      it('executing user has all permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN,
          GlobalPermission.TEAMS_LIST_ADMIN,
          GlobalPermission.SKILLS_LIST_ADMIN,
          GlobalPermission.READER,
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([otherUser.id]);
          });
      });

    });

    describe('skill has upvote from executing user', () => {

      beforeEach(() => {
        return TeamsDataHandler.upvoteTeamSkill(teamSkillToDownvote.id, executingUser.id);
      });

      it('executing user has no permissions should fail', () => {
        // Act
        var resultPromise: Promise<any> = operation.execute();

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
          });
      });

      it('executing user has GUEST permissions should fail', () => {
        // Arrange
        var permissions = [
          GlobalPermission.GUEST
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.rejected
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([executingUser.id]);
          });
      });

      it('executing user has READER permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.READER
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
          });
      });

      it('executing user has SKILLS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.SKILLS_LIST_ADMIN
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
          });
      });

      it('executing user has TEAMS_LIST_ADMIN permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.TEAMS_LIST_ADMIN
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
          });
      });

      it('executing user has ADMIN permissions should succeed', () => {
        // Arrange
        var permissions = [
          GlobalPermission.ADMIN
        ];

        var permissionsPromise: Promise<any> =
          UserDataHandler.addGlobalPermissions(executingUser.id, permissions);

        // Act
        var resultPromise: Promise<any> =
          permissionsPromise.then(() => operation.execute());

        // Assert
        return expect(resultPromise).to.eventually.fulfilled
          .then(() => TeamsDataHandler.getTeamSkills(team.id))
          .then((_teamSkills: ISkillOfATeam[]) => {
            expect(_teamSkills).to.be.length(1);

            expect(_teamSkills[0].skill.id).to.be.deep.equal(skillToDownvote.id);
            expect(_teamSkills[0].upvotingUserIds).to.be.deep.equal([]);
          });
      });

    });

  });

});
