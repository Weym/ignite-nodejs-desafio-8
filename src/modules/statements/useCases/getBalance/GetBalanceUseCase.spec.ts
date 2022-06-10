import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should return the user's balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "name",
      email: "email@email.com",
      password: "password",
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response.balance).toBe(0);

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 5,
      description: "deposit 5",
    });

    const response1 = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response1.balance).toBe(5);
  });

  it("should throw GetBalanceError if the user doesn't exists", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "non-existind_id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
