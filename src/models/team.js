"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var typesValidator_1 = require('../commonUtils/typesValidator');
var user_1 = require('./user');
var teamMember_1 = require('./teamMember');
var Team = (function (_super) {
    __extends(Team, _super);
    function Team() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Team.prototype, "tableName", {
        get: function () { return 'teams'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Team.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Team.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (team) { return _this.validateTeam(team); });
    };
    Team.prototype.validateTeam = function (team) {
        if (!typesValidator_1.TypesValidator.isLongEnoughString(team.attributes.name, 1)) {
            return Promise.reject('The team name must not be empty');
        }
        return null;
    };
    Team.prototype.getTeamMembers = function () {
        return this.belongsToMany(user_1.User).through(teamMember_1.TeamMember, 'team_id', 'user_id');
    };
    return Team;
}(bookshelf_1.bookshelf.Model));
exports.Team = Team;
var Teams = (function (_super) {
    __extends(Teams, _super);
    function Teams() {
        _super.apply(this, arguments);
        this.model = Team;
    }
    Teams.clearAll = function () {
        var promises = [];
        return new Teams().fetch().then(function (teams) {
            teams.each(function (team) {
                var promise = team.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return Teams;
}(bookshelf_1.bookshelf.Collection));
exports.Teams = Teams;
