import {StringManipulator} from "./stringManipulator";
import { expect } from 'chai';

describe('StringManipulator', () => {

  it('should replace correctly', () => {
    var original = 'abc1def1ghij1klmnop';
    var expected = 'abc2def2ghij2klmnop';

    expect(StringManipulator.replaceAll(original, '1', '2')).to.be.equal(expected);
  })

});
