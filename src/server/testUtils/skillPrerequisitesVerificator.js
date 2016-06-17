"use strict";
var chai_1 = require('chai');
var _ = require('lodash');
var SkillPrerquisitesVerificator = (function () {
    function SkillPrerquisitesVerificator() {
    }
    SkillPrerquisitesVerificator.verifySkillsPrerequisites = function (actual, expected) {
        chai_1.expect(actual.length, 'The number of skills prerequisites should be correct').to.be.equal(expected.length);
        var actualSorted = _.orderBy(actual, function (_) { return _.skill.id; });
        var expectedSorted = _.orderBy(expected, function (_) { return _.skill.id; });
        for (var i = 0; i < expected.length; i++) {
            var actualSkillPrerequistes = actualSorted[i];
            var expectedSkillPrerequistes = expectedSorted[i];
            var expectedSkillName = expectedSkillPrerequistes.skill.attributes.name;
            chai_1.expect(actualSkillPrerequistes.skill.id, 'should contain skill prerequisites for skill: ' + expectedSkillName).to.be.equal(expectedSkillPrerequistes.skill.id);
            chai_1.expect(actualSkillPrerequistes.prerequisiteSkillIds.sort()).to.be.deep.equal(expectedSkillPrerequistes.prerequisiteSkillIds);
        }
    };
    return SkillPrerquisitesVerificator;
}());
exports.SkillPrerquisitesVerificator = SkillPrerquisitesVerificator;
//# sourceMappingURL=skillPrerequisitesVerificator.js.map