import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

interface User {
  name: string;
  password: string;
  email: string;
}

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let newUser: User;

describe("Authenticate User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    newUser = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    await createUserUseCase.execute(newUser);
  });

  it("should authenticate the user if using correct credentials", async () => {
    const { email, password } = newUser;
    const { token, user } = await authenticateUserUseCase.execute({
      email,
      password,
    });

    expect(token).toBeDefined();
    expect(user).toBeDefined();
  });

  it("should not authenticate if wrong email or password", () => {
    const { email, password } = newUser;

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@doesntexists.com",
        password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email,
        password: "wrong_password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
