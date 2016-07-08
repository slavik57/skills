"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var typesValidator_1 = require("../../common/typesValidator");
var modelBase_1 = require("./modelBase");
var bookshelf_1 = require('../../../bookshelf');
var bluebirdPromise = require('bluebird');
var TeamCreator = (function (_super) {
    __extends(TeamCreator, _super);
    function TeamCreator() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TeamCreator.prototype, "tableName", {
        get: function () { return 'team_creator'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamCreator, "teamIdAttribute", {
        get: function () { return 'team_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamCreator, "userIdAttribute", {
        get: function () { return 'user_id'; },
        enumerable: true,
        configurable: true
    });
    TeamCreator.collection = function (teamsCreators, options) {
        return new TeamCreators(teamsCreators, options);
    };
    TeamCreator.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (_teamsCreator) { return _this._validateTeamCreator(_teamsCreator); });
    };
    TeamCreator.prototype._validateTeamCreator = function (teamCreator) {
        if (!typesValidator_1.TypesValidator.isInteger(teamCreator.attributes.team_id)) {
            return bluebirdPromise.reject(this._createError('The team_id must be an integer'));
        }
        if (!typesValidator_1.TypesValidator.isInteger(teamCreator.attributes.user_id)) {
            return bluebirdPromise.reject(this._createError('The user_id be an integer'));
        }
        return bluebirdPromise.resolve(true);
    };
    TeamCreator.prototype._createError = function (errorMessage) {
        var error = new Error();
        error.message = errorMessage;
        return error;
    };
    return TeamCreator;
}(modelBase_1.ModelBase));
exports.TeamCreator = TeamCreator;
var TeamCreators = (function (_super) {
    __extends(TeamCreators, _super);
    function TeamCreators() {
        _super.apply(this, arguments);
        this.model = TeamCreator;
    }
    TeamCreators.clearAll = function () {
        return new TeamCreators().query().del();
    };
    return TeamCreators;
}(bookshelf_1.bookshelf.Collection));
exports.TeamCreators = TeamCreators;
//# sourceMappingURL=teamCreator.js.map