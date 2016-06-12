import {ModelVerificator} from "./modelVerificator";
import {IPrerequisitesOfASkill} from "../models/interfaces/iPrerequisitesOfASkill";
import {expect} from 'chai';
import * as _ from 'lodash';

export class SkillPrerquisitesVerificator {

  public static verifySkillsPrerequisites(actual: IPrerequisitesOfASkill[], expected: IPrerequisitesOfASkill[]): void {
    expect(actual.length, 'The number of skills prerequisites should be correct').to.be.equal(expected.length);

    var actualSorted: IPrerequisitesOfASkill[] = _.orderBy(actual, _ => _.skill.id);
    var expectedSorted: IPrerequisitesOfASkill[] = _.orderBy(expected, _ => _.skill.id);

    for (var i = 0; i < expected.length; i++) {
      var actualSkillPrerequistes: IPrerequisitesOfASkill = actualSorted[i];
      var expectedSkillPrerequistes: IPrerequisitesOfASkill = expectedSorted[i];

      var expectedSkillName: string = expectedSkillPrerequistes.skill.attributes.name;

      expect(actualSkillPrerequistes.skill.id,
        'should contain skill prerequisites for skill: ' + expectedSkillName).to.be.equal(expectedSkillPrerequistes.skill.id);

      expect(actualSkillPrerequistes.prerequisiteSkillIds.sort()).to.be.deep.equal(expectedSkillPrerequistes.prerequisiteSkillIds);
    }
  }

}
