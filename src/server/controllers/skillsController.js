"use strict";
var getSkillByNameOperation_1 = require("../operations/skillsOperations/getSkillByNameOperation");
var removeSkillOperation_1 = require("../operations/skillsOperations/removeSkillOperation");
var alreadyExistsError_1 = require("../../common/errors/alreadyExistsError");
var unauthorizedError_1 = require("../../common/errors/unauthorizedError");
var errorUtils_1 = require("../../common/errors/errorUtils");
var addSkillOperation_1 = require("../operations/skillsOperations/addSkillOperation");
var getSkillsOperation_1 = require("../operations/skillsOperations/getSkillsOperation");
var statusCode_1 = require("../enums/statusCode");
var authenticator_1 = require("../expressMiddlewares/authenticator");
var _ = require('lodash');
module.exports = {
    get_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var operation = new getSkillsOperation_1.GetSkillsOperation();
            operation.execute()
                .then(function (_skills) {
                return _.map(_skills, function (_skill) {
                    return {
                        id: _skill.id,
                        skillName: _skill.attributes.name
                    };
                });
            })
                .then(function (_skillInfoResponses) {
                return _skillInfoResponses.sort(function (_info1, _info2) { return _info1.id - _info2.id; });
            })
                .then(function (_skillInfoResponses) {
                response.json(_skillInfoResponses);
            });
        }],
    get_skillName_exists: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, skillName) {
            var operation = new getSkillByNameOperation_1.GetSkillByNameOperation(skillName);
            operation.execute()
                .then(function (_skill) {
                var skillExists = !!_skill;
                response.send({
                    skillExists: skillExists
                });
            });
        }],
    post_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response) {
            var createSkillRequest = request.body;
            if (!createSkillRequest || !createSkillRequest.name) {
                response.status(statusCode_1.StatusCode.BAD_REQUEST);
                response.send();
                return;
            }
            var skillInfo = {
                name: createSkillRequest.name
            };
            var addOperation = new addSkillOperation_1.AddSkillOperation(request.user.id, skillInfo);
            addOperation.execute()
                .then(function (_skill) {
                response.status(statusCode_1.StatusCode.OK);
                response.send({
                    id: _skill.id,
                    skillName: _skill.attributes.name
                });
            }, function (error) {
                var statusCode = statusCode_1.StatusCode.INTERNAL_SERVER_ERROR;
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    statusCode = statusCode_1.StatusCode.UNAUTHORIZED;
                }
                else if (errorUtils_1.ErrorUtils.isErrorOfType(error, alreadyExistsError_1.AlreadyExistsError)) {
                    statusCode = statusCode_1.StatusCode.CONFLICT;
                }
                response.status(statusCode);
                response.send();
            });
        }],
    delete_skillId_index: [authenticator_1.Authenticator.ensureAuthenticated, function (request, response, skillId) {
            var numberId = Number(skillId);
            var operation = new removeSkillOperation_1.RemoveSkillOperation(request.user.id, numberId);
            operation.execute()
                .then(function () {
                response.status(statusCode_1.StatusCode.OK);
                response.send();
            }, function (error) {
                if (errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)) {
                    response.status(statusCode_1.StatusCode.UNAUTHORIZED);
                }
                else {
                    response.status(statusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                }
                response.send();
            });
        }],
};
//# sourceMappingURL=skillsController.js.map