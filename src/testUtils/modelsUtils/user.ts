import * as chai from 'chai';
import { expect } from 'chai';
import { Collection } from 'bookshelf';
import * as chaiAsPromised from 'chai-as-promised'
import { User, Users } from '../../models/user';


export class TestUtils {
  public static clearUsersTable(done: Function): void {
    var promises: Promise<User>[] = []

    new Users().fetch().then((users: Collection<User>) => {
      users.each(user => {
        var promise: Promise<User> = user.destroy(null);
        promises.push(promise);
      });

      Promise.all(promises).then(() => done());
    });
  }
}
