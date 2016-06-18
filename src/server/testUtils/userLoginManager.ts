import {IUserRegistrationDefinition} from "../passportStrategies/interfaces/iUserRegistrationDefinition";
import {SuperTest} from 'supertest';

export class UserLoginManager {
  public static registerUser(server: SuperTest, userDefinition: IUserRegistrationDefinition): Promise<void> {
    return new Promise((resolveCallback: (value?: void) => void) => {
      server.post('/register')
        .send(userDefinition)
        .end(() => resolveCallback());
    });
  }

  public static loginUser(server: SuperTest, userDefinition: IUserRegistrationDefinition): Promise<void> {
    return new Promise((resolveCallback: (value?: void) => void) => {
      server.post('/login')
        .send({ username: userDefinition.username, password: userDefinition.password })
        .end(() => resolveCallback());
    });
  }

  public static logoutUser(server: SuperTest): Promise<void> {
    return new Promise((resolveCallback: (value?: void) => void) => {
      server.get('/logout')
        .end(() => resolveCallback());
    });
  }
}
