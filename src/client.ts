import {B} from './client/b';

export class A extends B {
  constructor() {
    super();

    console.log(11223);
    alert(111);
  }
}

new A();

alert(222);
