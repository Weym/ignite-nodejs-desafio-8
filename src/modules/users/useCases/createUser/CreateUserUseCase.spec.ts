import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };
    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toHaveProperty("id");
    expect(createdUser.name).toBe("name");
  });

  it("should not be able to create a new user if the email is already registered", async () => {
    const uniqueEmail = "email@email.com";

    await createUserUseCase.execute({
      name: "name",
      email: uniqueEmail,
      password: "password",
    });

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "name",
        email: uniqueEmail,
        password: "password",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
