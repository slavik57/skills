"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var TeamSkillUpvote = (function (_super) {
    __extends(TeamSkillUpvote, _super);
    function TeamSkillUpvote() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TeamSkillUpvote.prototype, "tableName", {
        get: function () { return 'team_skill_upvotes'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkillUpvote.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkillUpvote, "teamSkillIdAttribute", {
        get: function () { return 'team_skill_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkillUpvote, "userIdAttribute", {
        get: function () { return 'user_id'; },
        enumerable: true,
        configurable: true
    });
    return TeamSkillUpvote;
}(bookshelf_1.bookshelf.Model));
exports.TeamSkillUpvote = TeamSkillUpvote;
var TeamSkillUpvotes = (function (_super) {
    __extends(TeamSkillUpvotes, _super);
    function TeamSkillUpvotes() {
        _super.apply(this, arguments);
        this.model = TeamSkillUpvote;
    }
    TeamSkillUpvotes.clearAll = function () {
        var promises = [];
        return new TeamSkillUpvotes().fetch().then(function (users) {
            users.each(function (teamSkillUpvotes) {
                var promise = teamSkillUpvotes.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return TeamSkillUpvotes;
}(bookshelf_1.bookshelf.Collection));
exports.TeamSkillUpvotes = TeamSkillUpvotes;
