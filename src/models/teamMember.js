"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var typesValidator_1 = require('../commonUtils/typesValidator');
var TeamMember = (function (_super) {
    __extends(TeamMember, _super);
    function TeamMember() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TeamMember.prototype, "tableName", {
        get: function () { return 'team_members'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamMember.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamMember, "teamIdAttribute", {
        get: function () { return 'team_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamMember, "userIdAttribute", {
        get: function () { return 'user_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamMember, "isAdminAttribute", {
        get: function () { return 'is_admin'; },
        enumerable: true,
        configurable: true
    });
    TeamMember.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (teamMember) { return _this.validateTeamMember(teamMember); });
    };
    TeamMember.prototype.validateTeamMember = function (teamMember) {
        if (!typesValidator_1.TypesValidator.isInteger(teamMember.attributes.team_id)) {
            return Promise.reject('The team_id must be an integer');
        }
        if (!typesValidator_1.TypesValidator.isInteger(teamMember.attributes.user_id)) {
            return Promise.reject('The user_id be an integer');
        }
        return null;
    };
    return TeamMember;
}(bookshelf_1.bookshelf.Model));
exports.TeamMember = TeamMember;
var TeamMembers = (function (_super) {
    __extends(TeamMembers, _super);
    function TeamMembers() {
        _super.apply(this, arguments);
        this.model = TeamMember;
    }
    TeamMembers.clearAll = function () {
        var promises = [];
        return new TeamMembers().fetch().then(function (users) {
            users.each(function (teamMembers) {
                var promise = teamMembers.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return TeamMembers;
}(bookshelf_1.bookshelf.Collection));
exports.TeamMembers = TeamMembers;
