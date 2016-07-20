export class StringManipulator {
  public static replaceAll(str: string, search: string, replaceWith: string): string {
    return str.replace(new RegExp(search, 'g'), replaceWith);
  }
}
