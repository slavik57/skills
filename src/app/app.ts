import './commonStyles/commonLayout.scss';
import './commonStyles/material-font/material-font.scss';

export class A {
  constructor() {
    console.log('env1:' + process.env.ENV);
  }
}

new A();
