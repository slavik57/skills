import './views/signin.scss';

export class A {
  constructor() {
    console.log('env1:' + process.env.ENV);
  }
}

new A();
