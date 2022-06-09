import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should show user profile", async () => {
    const newUser = await inMemoryUsersRepository.create({
      name: "name",
      email: "email@email.com",
      password: "password",
    });

    const user = await showUserProfileUseCase.execute(newUser.id as string);

    expect(user).toBeDefined();
    expect(user).toEqual(newUser);
  });

  it("should not show user profile when the user doesn't exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("id-that-does-not-exists");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
