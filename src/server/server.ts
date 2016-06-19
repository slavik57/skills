import {ExpressServer} from './expressServer';

ExpressServer.instance
  .initialize()
  .then((_expressServer: ExpressServer) => _expressServer.start());
