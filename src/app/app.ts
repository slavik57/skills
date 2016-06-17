export class A {
  constructor() {
    alert('env1:' + process.env.ENV);
  }
}

new A();
