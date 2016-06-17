import {B} from './b';

export class A extends B {
  constructor() {
    super();

    console.log(11223);
    alert('env1:' + process.env.ENV);
  }
}

new A();
