import {PathHelper} from "../../common/pathHelper";
import {ExpressServer} from "../ExpressServer";

export class PageTextResolver {
  public static getSigninPage(expressServer: ExpressServer): string {
    return this._getPage(expressServer, 'signin.html');
  }

  public static getHomePage(expressServer: ExpressServer): string {
    return this._getPage(expressServer, 'home.html');
  }

  private static _getPage(expressServer: ExpressServer, pageName: string): string {
    var webpackMiddleware = expressServer.webpackMiddleware;

    var buffer = webpackMiddleware.fileSystem.readFileSync(PathHelper.getPathFromRoot('dist', pageName));

    return new Buffer(buffer).toString();
  }
}
