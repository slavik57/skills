import * as path from 'path';

var _root = path.resolve(__dirname, '..');

export class PathHelper {
  public static getFullPathCombined(...args: string[]): string {
    args = Array.prototype.slice.call(arguments, 0);

    return path.join.apply(path, [_root].concat(args));
  }
}
