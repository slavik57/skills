import * as path from 'path';

export class PathHelper {
  public static root: string = path.resolve(__dirname, '..', '..');

  public static getPathFromRoot(...args: string[]): string {
    args = Array.prototype.slice.call(arguments, 0);

    return path.join.apply(path, [this.root].concat(args));
  }
}
