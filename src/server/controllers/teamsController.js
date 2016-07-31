"use strict";
var getTeamsOperation_1 = require("../operations/teamOperations/getTeamsOperation");
var authenticator_1 = require("../expressMiddlewares/authenticator");
var _ = require('lodash');
module.exports = {
    get_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getTeamsOperation_1.GetTeamsOperation();
            operation.execute()
                .then(function (_teams) {
                return _.map(_teams, function (_team) {
                    return {
                        id: _team.id,
                        teamName: _team.attributes.name
                    };
                });
            })
                .then(function (_teamInfoResponses) {
                response.json(_teamInfoResponses);
            });
        }]
};
//# sourceMappingURL=teamsController.js.map